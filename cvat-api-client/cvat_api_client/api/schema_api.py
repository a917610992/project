"""
    CVAT REST API

    REST API for Computer Vision Annotation Tool (CVAT)  # noqa: E501

    The version of the OpenAPI document: alpha (2.0)
    Contact: nikita.manovich@intel.com
    Generated by: https://openapi-generator.tech
"""


from __future__ import annotations

import re  # noqa: F401
import sys  # noqa: F401
import typing
from typing import TYPE_CHECKING, overload

import urllib3

from cvat_api_client.api_client import ApiClient
from cvat_api_client.api_client import Endpoint as _Endpoint
from cvat_api_client.model_utils import (  # noqa: F401
    check_allowed_values,
    check_validations,
    date,
    datetime,
    file_type,
    none_type,
    validate_and_convert_types,
)

if TYPE_CHECKING:
    # Enable introspection. Can't work normally due to cyclic imports
    from cvat_api_client.apis import *
    from cvat_api_client.models import *


class SchemaApi(object):
    """NOTE: This class is auto generated by OpenAPI Generator
    Ref: https://openapi-generator.tech

    Do not edit the class manually.
    """

    def __init__(self, api_client=None):
        if api_client is None:
            api_client = ApiClient()
        self.api_client = api_client
        self.retrieve_endpoint = _Endpoint(
            settings={
                "response_type": (
                    {str: (bool, date, datetime, dict, float, int, list, str, none_type)},
                ),
                "auth": ["SignatureAuthentication", "basicAuth", "cookieAuth", "tokenAuth"],
                "endpoint_path": "/api/schema/",
                "operation_id": "retrieve",
                "http_method": "GET",
                "servers": None,
            },
            params_map={
                "all": [
                    "x_organization",
                    "lang",
                    "org",
                    "org_id",
                    "scheme",
                ],
                "required": [],
                "nullable": [],
                "enum": [
                    "lang",
                    "scheme",
                ],
                "validation": [],
            },
            root_map={
                "validations": {},
                "allowed_values": {
                    ("lang",): {
                        "AF": "af",
                        "AR": "ar",
                        "AR-DZ": "ar-dz",
                        "AST": "ast",
                        "AZ": "az",
                        "BE": "be",
                        "BG": "bg",
                        "BN": "bn",
                        "BR": "br",
                        "BS": "bs",
                        "CA": "ca",
                        "CS": "cs",
                        "CY": "cy",
                        "DA": "da",
                        "DE": "de",
                        "DSB": "dsb",
                        "EL": "el",
                        "EN": "en",
                        "EN-AU": "en-au",
                        "EN-GB": "en-gb",
                        "EO": "eo",
                        "ES": "es",
                        "ES-AR": "es-ar",
                        "ES-CO": "es-co",
                        "ES-MX": "es-mx",
                        "ES-NI": "es-ni",
                        "ES-VE": "es-ve",
                        "ET": "et",
                        "EU": "eu",
                        "FA": "fa",
                        "FI": "fi",
                        "FR": "fr",
                        "FY": "fy",
                        "GA": "ga",
                        "GD": "gd",
                        "GL": "gl",
                        "HE": "he",
                        "HI": "hi",
                        "HR": "hr",
                        "HSB": "hsb",
                        "HU": "hu",
                        "HY": "hy",
                        "IA": "ia",
                        "ID": "id",
                        "IG": "ig",
                        "IO": "io",
                        "IS": "is",
                        "IT": "it",
                        "JA": "ja",
                        "KA": "ka",
                        "KAB": "kab",
                        "KK": "kk",
                        "KM": "km",
                        "KN": "kn",
                        "KO": "ko",
                        "KY": "ky",
                        "LB": "lb",
                        "LT": "lt",
                        "LV": "lv",
                        "MK": "mk",
                        "ML": "ml",
                        "MN": "mn",
                        "MR": "mr",
                        "MY": "my",
                        "NB": "nb",
                        "NE": "ne",
                        "NL": "nl",
                        "NN": "nn",
                        "OS": "os",
                        "PA": "pa",
                        "PL": "pl",
                        "PT": "pt",
                        "PT-BR": "pt-br",
                        "RO": "ro",
                        "RU": "ru",
                        "SK": "sk",
                        "SL": "sl",
                        "SQ": "sq",
                        "SR": "sr",
                        "SR-LATN": "sr-latn",
                        "SV": "sv",
                        "SW": "sw",
                        "TA": "ta",
                        "TE": "te",
                        "TG": "tg",
                        "TH": "th",
                        "TK": "tk",
                        "TR": "tr",
                        "TT": "tt",
                        "UDM": "udm",
                        "UK": "uk",
                        "UR": "ur",
                        "UZ": "uz",
                        "VI": "vi",
                        "ZH-HANS": "zh-hans",
                        "ZH-HANT": "zh-hant",
                    },
                    ("scheme",): {"JSON": "json", "YAML": "yaml"},
                },
                "openapi_types": {
                    "x_organization": (str,),
                    "lang": (str,),
                    "org": (str,),
                    "org_id": (int,),
                    "scheme": (str,),
                },
                "attribute_map": {
                    "x_organization": "X-Organization",
                    "lang": "lang",
                    "org": "org",
                    "org_id": "org_id",
                    "scheme": "scheme",
                },
                "location_map": {
                    "x_organization": "header",
                    "lang": "query",
                    "org": "query",
                    "org_id": "query",
                    "scheme": "query",
                },
                "collection_format_map": {},
            },
            headers_map={
                "accept": [
                    "application/vnd.oai.openapi",
                    "application/yaml",
                    "application/vnd.oai.openapi+json",
                    "application/json",
                ],
                "content_type": [],
            },
            api_client=api_client,
        )

    @overload
    def retrieve(
        self,
        _return_http_data_only: typing.Literal[True] = True,
        _parse_response: typing.Literal[True] = True,
        **kwargs,
    ) -> typing.Union[typing.Dict[str, (typing.Any, none_type)]]:
        ...

    @overload
    def retrieve(
        self,
        _return_http_data_only: typing.Literal[False],
        _parse_response: typing.Literal[False],
        **kwargs,
    ) -> typing.Tuple[
        typing.Union[typing.Dict[str, (typing.Any, none_type)]], int, typing.Dict[str, str]
    ]:
        ...

    @overload
    def retrieve(
        self, _return_http_data_only: typing.Literal[False], **kwargs
    ) -> typing.Tuple[
        typing.Union[typing.Dict[str, (typing.Any, none_type)]], int, typing.Dict[str, str]
    ]:
        ...

    @overload
    def retrieve(self, _parse_response: typing.Literal[False], **kwargs) -> urllib3.HTTPResponse:
        ...

    @overload
    def retrieve(
        self,
        _return_http_data_only: typing.Literal[True],
        _parse_response: typing.Literal[False],
        **kwargs,
    ) -> urllib3.HTTPResponse:
        ...

    @overload
    def retrieve(
        self,
        _return_http_data_only: typing.Literal[False],
        _parse_response: typing.Literal[False],
        **kwargs,
    ) -> urllib3.HTTPResponse:
        ...

    def retrieve(
        self, **kwargs
    ) -> typing.Union[
        typing.Tuple[
            typing.Union[typing.Dict[str, (typing.Any, none_type)]], int, typing.Dict[str, str]
        ],
        urllib3.HTTPResponse,
        typing.Union[typing.Dict[str, (typing.Any, none_type)]],
    ]:
        """retrieve  # noqa: E501

        OpenApi3 schema for this API. Format can be selected via content negotiation.  - YAML: application/vnd.oai.openapi - JSON: application/vnd.oai.openapi+json  # noqa: E501
        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async_req=True

        >>> thread = api.retrieve(async_req=True)
        >>> result = thread.get()


        Keyword Args:
            x_organization (str): [optional]
            lang (str): [optional]
            org (str): Organization unique slug. [optional]
            org_id (int): Organization identifier. [optional]
            scheme (str): [optional]
            _return_http_data_only (bool): response data without head status
                code and headers. Default is True.
            _parse_response (bool): if False, the urllib3.HTTPResponse object
                will be returned without reading/decoding response data.
                Checked before _return_http_data_only.
                Default is True.
            _request_timeout (int/float/tuple): timeout setting for this request. If
                one number provided, it will be total request timeout. It can also
                be a pair (tuple) of (connection, read) timeouts.
                Default is None.
            _check_input_type (bool): specifies if type checking
                should be done one the data sent to the server.
                Default is True.
            _check_return_type (bool): specifies if type checking
                should be done one the data received from the server.
                Default is True.
            _check_status (bool): whether to check response status
                for being positive or not.
                Default is True
            _spec_property_naming (bool): True if the variable names in the input data
                are serialized names, as specified in the OpenAPI document.
                False if the variable names in the input data
                are pythonic names, e.g. snake case (default)
            _content_type (str/None): force body content-type.
                Default is None and content-type will be predicted by allowed
                content-types and body.
            _host_index (int/None): specifies the index of the server
                that we want to use.
                Default is read from the configuration.
            _request_auths (list): set to override the auth_settings for an a single
                request; this effectively ignores the authentication
                in the spec for a single request.
                Default is None
            async_req (bool): execute request asynchronously

        Returns:
            {str: (bool, date, datetime, dict, float, int, list, str, none_type)}
                If the method is called asynchronously, returns the request
                thread.
        """
        kwargs["async_req"] = kwargs.get("async_req", False)
        kwargs["_return_http_data_only"] = kwargs.get("_return_http_data_only", True)
        kwargs["_parse_response"] = kwargs.get("_parse_response", True)
        kwargs["_request_timeout"] = kwargs.get("_request_timeout", None)
        kwargs["_check_input_type"] = kwargs.get("_check_input_type", True)
        kwargs["_check_return_type"] = kwargs.get("_check_return_type", True)
        kwargs["_check_status"] = kwargs.get("_check_status", True)
        kwargs["_spec_property_naming"] = kwargs.get("_spec_property_naming", False)
        kwargs["_content_type"] = kwargs.get("_content_type")
        kwargs["_host_index"] = kwargs.get("_host_index")
        kwargs["_request_auths"] = kwargs.get("_request_auths", None)
        return self.retrieve_endpoint.call_with_http_info(**kwargs)

    def retrieve_raw(self, *args, **kwargs) -> urllib3.HTTPResponse:
        """
        The same as retrieve(), but returns the response unprocessed.
        Equivalent to calling retrieve with
        _parse_response = False and _check_status=False

        retrieve  # noqa: E501

        OpenApi3 schema for this API. Format can be selected via content negotiation.  - YAML: application/vnd.oai.openapi - JSON: application/vnd.oai.openapi+json  # noqa: E501
        This method makes a synchronous HTTP request by default. To make an
        asynchronous HTTP request, please pass async_req=True

        >>> thread = api.retrieve(async_req=True)
        >>> result = thread.get()


        Keyword Args:
            x_organization (str): [optional]
            lang (str): [optional]
            org (str): Organization unique slug. [optional]
            org_id (int): Organization identifier. [optional]
            scheme (str): [optional]
            _request_timeout (int/float/tuple): timeout setting for this request. If
                one number provided, it will be total request timeout. It can also
                be a pair (tuple) of (connection, read) timeouts.
                Default is None.
            _check_input_type (bool): specifies if type checking
                should be done one the data sent to the server.
                Default is True.
            _spec_property_naming (bool): True if the variable names in the input data
                are serialized names, as specified in the OpenAPI document.
                False if the variable names in the input data
                are pythonic names, e.g. snake case (default)
            _content_type (str/None): force body content-type.
                Default is None and content-type will be predicted by allowed
                content-types and body.
            _host_index (int/None): specifies the index of the server
                that we want to use.
                Default is read from the configuration.
            _request_auths (list): set to override the auth_settings for an a single
                request; this effectively ignores the authentication
                in the spec for a single request.
                Default is None
            async_req (bool): execute request asynchronously

        Returns:
            {str: (bool, date, datetime, dict, float, int, list, str, none_type)}
                If the method is called asynchronously, returns the request
                thread.
        """
        return self.retrieve(*args, **kwargs, _parse_response=False, _check_status=False)
