from .event_type import EventTypeChoice
from .models import (
    Webhook,
    WebhookContentTypeChoice,
    WebhookTypeChoice,
    WebhookDelivery,
)
from rest_framework import serializers
from cvat.apps.engine.serializers import BasicUserSerializer


class EventsSerializer(serializers.MultipleChoiceField):
    def __init__(self, *args, **kwargs):
        super().__init__(choices=EventTypeChoice.choices(), *args, **kwargs)

    def to_representation(self, value):
        return super().to_representation(value.split(","))

    def to_internal_value(self, data):
        return ",".join(super().to_internal_value(data))


class WebhookReadSerializer(serializers.ModelSerializer):
    owner = BasicUserSerializer(read_only=True, required=False)

    events = EventsSerializer(read_only=True)

    type = serializers.ChoiceField(choices=WebhookTypeChoice.choices())
    content_type = serializers.ChoiceField(choices=WebhookContentTypeChoice.choices())

    last_status = serializers.IntegerField(
        source="deliveries.last.status_code", read_only=True
    )

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if ret.get("type", "") == WebhookTypeChoice.PROJECT.value:
            ret.pop(WebhookTypeChoice.ORGANIZATION.value)
        elif ret.get("type", "") == WebhookTypeChoice.ORGANIZATION.value:
            ret.pop(WebhookTypeChoice.PROJECT.value)
        return ret

    class Meta:
        model = Webhook
        fields = (
            "id",
            "url",
            "target_url",
            "type",
            "content_type",
            "is_active",
            "enable_ssl",
            "created_date",
            "updated_date",
            "owner",
            "project",
            "organization",
            "events",
            "last_status",
        )
        read_only_fields = fields


class WebhookWriteSerializer(serializers.ModelSerializer):
    events = EventsSerializer(write_only=True)

    # Q: should be owner_id required or not?
    owner_id = serializers.IntegerField(
        write_only=True, allow_null=True, required=False
    )

    organization_id = serializers.IntegerField(
        write_only=True, allow_null=True, required=False
    )
    project_id = serializers.IntegerField(
        write_only=True, allow_null=True, required=False
    )

    def to_representation(self, instance):
        serializer = WebhookReadSerializer(instance, context=self.context)
        return serializer.data

    class Meta:
        model = Webhook
        fields = (
            "target_url",
            "type",
            "content_type",
            "secret",
            "is_active",
            "enable_ssl",
            "owner_id",
            "project_id",
            "organization_id",
            "events",
        )
        write_once_fields = ("owner_id", "project_id", "organization_id")

    def create(self, validated_data):
        db_webhook = Webhook.objects.create(**validated_data)
        return db_webhook


class WebhookDeliveryReadSerializer(serializers.ModelSerializer):
    webhook_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = WebhookDelivery
        fields = (
            "id",
            "webhook_id",
            "event",
            "status_code",
            "redelivery",
            "delivered_at",
            "changed_fields",
            "request",
            "response",
        )
        read_only_fields = fields
