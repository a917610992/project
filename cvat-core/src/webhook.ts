// Copyright (C) 2022 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import User from './user';

const PluginRegistry = require('./plugins');
const serverProxy = require('./server-proxy');

interface WebhookEvent {
    id?: number;
    name: string;
    description: string;
}

interface RawWebhookData {
    id?: number;
    type: 'project' | 'organization';
    target_url: string;
    organization_id?: number;
    project_id?: number;
    events: WebhookEvent[];
    content_type: 'application/json';
    secret?: string;
    enable_ssl: boolean;
    description?: string;
    is_active?: boolean;
    owner?: any;
    created_date?: string;
    updated_date?: string;
}

export default class Webhook {
    public readonly id?: number;
    public readonly type: RawWebhookData['type'];
    public readonly targetURL: string;
    public readonly events: WebhookEvent[];
    public readonly contentType: RawWebhookData['content_type'];
    public readonly description?: string;
    public readonly organizationID?: number;
    public readonly projectID?: number;
    public readonly secret?: string;
    public readonly isActive?: boolean;
    public readonly enableSSL: boolean;
    public readonly owner?: User;
    public readonly createdDate?: string;
    public readonly updatedDate?: string;

    static async events(): Promise<string[]> {
        return serverProxy.webhooks.events();
    }

    constructor(initialData: RawWebhookData) {
        const data: RawWebhookData = {
            id: undefined,
            target_url: '',
            type: 'organization',
            events: [],
            content_type: 'application/json',
            organization_id: undefined,
            project_id: undefined,
            description: undefined,
            secret: '',
            is_active: undefined,
            enable_ssl: undefined,
            owner: undefined,
            created_date: undefined,
            updated_date: undefined,
        };

        for (const property in data) {
            if (Object.prototype.hasOwnProperty.call(data, property) && property in initialData) {
                data[property] = initialData[property];
            }
        }

        if (data.owner) {
            data.owner = new User(data.owner);
        }

        Object.defineProperties(
            this,
            Object.freeze({
                id: {
                    get: () => data.id,
                },
                type: {
                    get: () => data.type,
                },
                targetURL: {
                    get: () => data.target_url,
                },
                events: {
                    get: () => data.events,
                },
                contentType: {
                    get: () => data.content_type,
                },
                organizationID: {
                    get: () => data.organization_id,
                },
                projectID: {
                    get: () => data.project_id,
                },
                description: {
                    get: () => data.description,
                },
                secret: {
                    get: () => data.secret,
                },
                isActive: {
                    get: () => data.is_active,
                },
                enableSSL: {
                    get: () => data.enable_ssl,
                },
                owner: {
                    get: () => data.owner,
                },
                createdDate: {
                    get: () => data.created_date,
                },
                updatedDate: {
                    get: () => data.updated_date,
                },
            }),
        );
    }

    public toJSON(): RawWebhookData {
        const result: RawWebhookData = {
            target_url: this.targetURL,
            events: [...this.events],
            content_type: this.contentType,
            enable_ssl: this.enableSSL,
            type: this.type || 'organization', // TODO: Fix hardcoding
        };

        if (Number.isInteger(this.id)) {
            result.id = this.id;
        }

        if (Number.isInteger(this.organizationID)) {
            result.organization_id = this.organizationID;
        }

        if (Number.isInteger(this.projectID)) {
            result.project_id = this.projectID;
        }

        if (this.description) {
            result.description = this.description;
        }

        if (this.secret) {
            result.secret = this.secret;
        }

        if (typeof this.isActive === 'boolean') {
            result.is_active = this.isActive;
        }

        if (this.owner instanceof User) {
            result.owner = this.owner.serialize();
        }

        if (this.createdDate) {
            result.created_date = this.createdDate;
        }

        if (this.updatedDate) {
            result.updated_date = this.updatedDate;
        }

        return result;
    }

    public async save(): Promise<Webhook> {
        const result = await PluginRegistry.apiWrapper.call(this, Webhook.prototype.save);
        return result;
    }

    public async delete(): Promise<void> {
        const result = await PluginRegistry.apiWrapper.call(this, Webhook.prototype.delete);
        return result;
    }

    public async ping(): Promise<void> {
        const result = await PluginRegistry.apiWrapper.call(this, Webhook.prototype.ping);
        return result;
    }
}

Object.defineProperties(Webhook.prototype.save, {
    implementation: {
        writable: false,
        enumerable: false,
        value: async function implementation() {
            console.log(this);
            if (Number.isInteger(this.id)) {
                const result = await serverProxy.webhook.update(this.id, this.toJSON());
                return new Webhook(result);
            }

            const result = await serverProxy.webhooks.create(this.toJSON());
            return new Webhook(result);
        },
    },
});

Object.defineProperties(Webhook.prototype.delete, {
    implementation: {
        writable: false,
        enumerable: false,
        value: async function implementation() {
            if (Number.isInteger(this.id)) {
                await serverProxy.webhooks.delete(this.id);
            }
        },
    },
});

Object.defineProperties(Webhook.prototype.ping, {
    implementation: {
        writable: false,
        enumerable: false,
        value: async function implementation() {
            if (Number.isInteger(this.id)) {
                await serverProxy.webhooks.ping(this.id);
            } else {
                throw new Error('The webhook has not been saved on the server yet');
            }
        },
    },
});
