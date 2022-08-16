# Copyright (C) 2022 CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from __future__ import annotations

import json
import os.path as osp
from typing import Optional

from cvat_sdk.api_client import apis, models
from cvat_sdk.core.downloading import Downloader
from cvat_sdk.core.model_proxy import (
    Entity,
    ModelCreateMixin,
    ModelDeleteMixin,
    ModelListMixin,
    ModelProxy,
    ModelRetrieveMixin,
    ModelUpdateMixin,
    Repo,
)
from cvat_sdk.core.progress import ProgressReporter
from cvat_sdk.core.uploading import DatasetUploader, Uploader


class _ProjectProxy(ModelProxy[models.ProjectRead, apis.ProjectsApi]):
    _api_member_name = "projects_api"


class Project(_ProjectProxy, Entity, models.IProjectRead, ModelUpdateMixin):
    _model_partial_update_arg = "patched_project_write_request"

    def import_dataset(
        self,
        format_name: str,
        filename: str,
        *,
        status_check_period: Optional[int] = None,
        pbar: Optional[ProgressReporter] = None,
    ):
        """
        Import dataset for a project in the specified format (e.g. 'YOLO ZIP 1.0').
        """

        DatasetUploader(self._client).upload_file_and_wait(
            self.api.create_dataset_endpoint,
            filename,
            format_name,
            url_params={"id": self.id},
            pbar=pbar,
            status_check_period=status_check_period,
        )

        self._client.logger.info(f"Annotation file '{filename}' for project #{self.id} uploaded")

    def export_dataset(
        self,
        format_name: str,
        filename: str,
        *,
        pbar: Optional[ProgressReporter] = None,
        status_check_period: Optional[int] = None,
        include_images: bool = True,
    ) -> None:
        """
        Download annotations for a project in the specified format (e.g. 'YOLO ZIP 1.0').
        """
        if include_images:
            endpoint = self.api.retrieve_dataset_endpoint
        else:
            endpoint = self.api.retrieve_annotations_endpoint

        Downloader(self._client).prepare_and_download_file_from_endpoint(
            endpoint=endpoint,
            filename=filename,
            url_params={"id": self.id},
            query_params={"format": format_name},
            pbar=pbar,
            status_check_period=status_check_period,
        )

        self._client.logger.info(f"Dataset for project {self.id} has been downloaded to {filename}")

    def download_backup(
        self,
        filename: str,
        *,
        status_check_period: int = None,
        pbar: Optional[ProgressReporter] = None,
    ) -> None:
        """
        Download a project backup
        """

        Downloader(self._client).prepare_and_download_file_from_endpoint(
            self.api.retrieve_backup_endpoint,
            filename=filename,
            pbar=pbar,
            status_check_period=status_check_period,
            url_params={"id": self.id},
        )

        self._client.logger.info(f"Backup for project {self.id} has been downloaded to {filename}")


class ProjectsRepo(
    _ProjectProxy,
    Repo,
    ModelCreateMixin[Project],
    ModelListMixin[Project],
    ModelRetrieveMixin[Project],
    ModelDeleteMixin,
):
    _entity_type = Project

    def create(self, spec: models.IProjectWriteRequest, **kwargs) -> Project:
        project = super().create(spec, **kwargs)
        self._client.logger.info("Created project ID: %s NAME: %s", project.id, project.name)
        return project

    def create_from_dataset(
        self,
        spec: models.IProjectWriteRequest,
        *,
        dataset_path: str = "",
        dataset_format: str = "CVAT XML 1.1",
        status_check_period: int = None,
        pbar: Optional[ProgressReporter] = None,
    ) -> Project:
        """
        Create a new project with the given name and labels JSON and
        add the files to it.

        Returns: id of the created project
        """
        project = self.create(spec=spec)

        if dataset_path:
            project.import_dataset(
                format_name=dataset_format,
                filename=dataset_path,
                pbar=pbar,
                status_check_period=status_check_period,
            )

        project.fetch()
        return project

    def create_from_backup(
        self,
        filename: str,
        *,
        status_check_period: int = None,
        pbar: Optional[ProgressReporter] = None,
    ) -> Project:
        """
        Import a project from a backup file
        """
        if status_check_period is None:
            status_check_period = self.config.status_check_period

        params = {"filename": osp.basename(filename)}
        url = self.api_map.make_endpoint_url(self.api.create_backup_endpoint.path)

        uploader = Uploader(self)
        response = uploader.upload_file(
            url,
            filename,
            meta=params,
            query_params=params,
            pbar=pbar,
            logger=self._client.logger.debug,
        )

        rq_id = json.loads(response.data)["rq_id"]
        response = self._client.wait_for_completion(
            url,
            success_status=201,
            positive_statuses=[202],
            post_params={"rq_id": rq_id},
            status_check_period=status_check_period,
        )

        project_id = json.loads(response.data)["id"]
        self._client.logger.info(f"Project has been imported sucessfully. Project ID: {project_id}")

        return self.retrieve(project_id)
