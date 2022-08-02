// Copyright (C) 2021-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
import Text from 'antd/lib/typography/Text';
import Select from 'antd/lib/select';
import Notification from 'antd/lib/notification';
import message from 'antd/lib/message';
import Upload, { RcFile } from 'antd/lib/upload';

import { StorageLocation } from 'reducers/interfaces';

import {
    UploadOutlined, InboxOutlined, LoadingOutlined, QuestionCircleOutlined,
} from '@ant-design/icons';

import CVATTooltip from 'components/common/cvat-tooltip';
import { CombinedState } from 'reducers/interfaces';
import { importActions, importDatasetAsync } from 'actions/import-actions';
import { uploadJobAnnotationsAsync } from 'actions/annotation-actions';

import ImportDatasetStatusModal from './import-dataset-status-modal';
import Space from 'antd/lib/space';
import Switch from 'antd/lib/switch';
import Tooltip from 'antd/lib/tooltip';

import getCore from 'cvat-core-wrapper';
import StorageField from 'components/storage/storage';
import { Storage } from 'reducers/interfaces';
import Input from 'antd/lib/input/Input';


const { confirm } = Modal;

const core = getCore();

type FormValues = {
    selectedFormat: string | undefined;
    location?: string | undefined;
    cloudStorageId?: number | undefined;
    fileName?: string | undefined;
};

interface UploadParams {
    resource: 'annotation' | 'dataset' | null;
    useDefaultSettings: boolean;
    sourceStorage: Storage;
    selectedFormat: string | null;
    file: File | null;
    fileName: string | null;
}

function ImportDatasetModal(): JSX.Element | null {
    const [form] = Form.useForm();
    const [instanceType, setInstanceType] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const importers = useSelector((state: CombinedState) => state.formats.annotationFormats.loaders);
    const dispatch = useDispatch();

    const resource = useSelector((state: CombinedState) =>  state.import.resource);
    const instanceT = useSelector((state: CombinedState) =>  state.import.instanceType);
    const projectsImportState = useSelector((state: CombinedState) => state.import.projects);
    const tasksImportState = useSelector((state: CombinedState) => state.import.tasks);
    const jobsImportState = useSelector((state: CombinedState) => state.import.jobs);

    const [modalVisible, setModalVisible] = useState(false);
    const [instance, setInstance] = useState<any>(null);

    useEffect(() => {
        if (instanceT === 'project' && projectsImportState) {
            setModalVisible(projectsImportState.modalVisible);
            setInstance(projectsImportState.instance);
        } else if (instanceT === 'task' && tasksImportState) {
            setModalVisible(tasksImportState.modalVisible);
            setInstance(tasksImportState.instance);
        } else if (instanceT === 'job' && jobsImportState) {
            setModalVisible(jobsImportState.modalVisible);
            setInstance(jobsImportState.instance);
        }
    }, [instanceT, projectsImportState, tasksImportState, jobsImportState])

    // const modalVisible = useSelector((state: CombinedState) => {

    // });
    //const instance = useSelector((state: CombinedState) => state.import.instance);
    //const currentImportId = useSelector((state: CombinedState) => state.import.importingId);


    // todo need to remove one of state item or form item
    const [useDefaultSettings, setUseDefaultSettings] = useState(true);
    const [defaultStorageLocation, setDefaultStorageLocation] = useState<string>('');
    const [defaultStorageCloudId, setDefaultStorageCloudId] = useState<number | null>(null);
    const [helpMessage, setHelpMessage] = useState('');
    const [selectedSourceStorage, setSelectedSourceStorage] = useState<Storage | null>(null);


    const [uploadParams, setUploadParams] = useState<UploadParams | null>(null);

    useEffect(() => {
        if (instance && modalVisible) { // && resource === 'dataset'
            if (instance instanceof core.classes.Project || instance instanceof core.classes.Task) {
                setDefaultStorageLocation((instance.sourceStorage) ?
                    instance.sourceStorage.location : null);
                setDefaultStorageCloudId((instance.sourceStorage) ?
                    instance.sourceStorage.cloud_storage_id
                : null);
                if (instance instanceof core.classes.Project) {
                    setInstanceType(`project #${instance.id}`);
                } else {
                    setInstanceType(`task #${instance.id}`);
                }
            } else if (instance instanceof core.classes.Job) {
                core.tasks.get({ id: instance.taskId }).then((response: any) => {
                    if (response.length) {
                        const [taskInstance] = response;
                        setDefaultStorageLocation((taskInstance.sourceStorage) ?
                            taskInstance.sourceStorage.location : null);
                        setDefaultStorageCloudId((taskInstance.sourceStorage) ?
                            taskInstance.sourceStorage.cloud_storage_id
                        : null);
                    }
                });
            }
        }
    }, [instance?.id, resource, instance?.sourceStorage]);

    useEffect(() => {
        setHelpMessage(
            `Import from ${(defaultStorageLocation) ? defaultStorageLocation.split('_')[0] : 'local'} ` +
            `storage ${(defaultStorageCloudId) ? '№' + defaultStorageCloudId : ''}`);
    }, [defaultStorageLocation, defaultStorageCloudId]);


    const uploadLocalFile = (): JSX.Element => {
        return (
            <Upload.Dragger
                listType='text'
                fileList={file ? [file] : ([] as any[])}
                beforeUpload={(_file: RcFile): boolean => {
                    if (!['application/zip', 'application/x-zip-compressed'].includes(_file.type)) {
                        message.error('Only ZIP archive is supported');
                    } else {
                        setFile(_file);
                    }
                    return false;
                }}
                onRemove={() => {
                    setFile(null);
                }}
            >
                <p className='ant-upload-drag-icon'>
                    <InboxOutlined />
                </p>
                <p className='ant-upload-text'>Click or drag file to this area</p>
            </Upload.Dragger>
        );
    };

    const renderCustomName = (): JSX.Element => {
        return (
            <Form.Item label={<Text strong>File name</Text>} name='fileName'>
                <Input
                    placeholder='Dataset file name'
                    className='cvat-modal-import-filename-input'
                />
            </Form.Item>
        );
    }

    const closeModal = useCallback((): void => {
        form.resetFields();
        setFile(null);
        dispatch(importActions.closeImportModal(instance));
    }, [form]);

    const onUpload = () => {
        if (uploadParams && uploadParams.resource) {
            // if (instance instanceof core.classes.Job) {
            //     dispatch(uploadJobAnnotationsAsync(instance, loader, file));
            // }
            dispatch(importDatasetAsync(
                instance, uploadParams.selectedFormat as string,
                uploadParams.useDefaultSettings, uploadParams.sourceStorage,
                uploadParams.file, uploadParams.fileName));
            const resource = uploadParams.resource.charAt(0).toUpperCase() + uploadParams.resource.slice(1);
            Notification.info({
                message: `${resource} import started`,
                description: `${resource} import was started for ${instanceType}. `,
                className: `cvat-notification-notice-import-${uploadParams.resource}-start`,
            });
        }
    }

    const confirmUpload = () => {
        confirm({
            title: 'Current annotation will be lost',
            content: `You are going to upload new annotations to ${instanceType}. Continue?`,
            className: `cvat-modal-content-load-${instanceType}-annotation`,
            onOk: () => {
                onUpload();
            },
            okButtonProps: {
                type: 'primary',
                danger: true,
            },
            okText: 'Update',
        })
    }

    const handleImport = useCallback(
        (values: FormValues): void => {
            if (file === null && !values.fileName) {
                Notification.error({
                    message: 'No dataset file specified',
                });
                return;
            }
            const fileName = (values.location === StorageLocation.CLOUD_STORAGE) ? values.fileName : null;
            const sourceStorage = {
                location: (values.location) ? values.location : defaultStorageLocation,
                cloudStorageId: (values.location) ? values.cloudStorageId : defaultStorageCloudId,
            } as Storage;

            setUploadParams({
                resource,
                selectedFormat: values.selectedFormat || null,
                useDefaultSettings,
                sourceStorage,
                file: file || null,
                fileName: fileName || null
            });

            if (resource === 'annotation') {
                confirmUpload();
            } else {
                onUpload();
            }
            closeModal();
        },
        // another dependensis like instance type
        [instance?.id, file, useDefaultSettings],
    );

    // if (!(resource in ['dataset', 'annotation'])) {
    //     return null;
    // }

    return (
        <>
            <Modal
                title={(
                    <>
                        <Text>Import {resource} to {instanceType}</Text>
                        <CVATTooltip
                            title={
                                instance && !instance.labels.length ?
                                    'Labels will be imported from dataset' :
                                    'Labels from project will be used'
                            }
                        >
                            <QuestionCircleOutlined className='cvat-modal-import-header-question-icon' />
                        </CVATTooltip>
                    </>
                )}
                visible={modalVisible}
                onCancel={closeModal}
                onOk={() => form.submit()}
                className='cvat-modal-import-dataset'
            >
                <Form
                    name={`Import ${resource}`}
                    form={form}
                    initialValues={{ selectedFormat: undefined } as FormValues}
                    onFinish={handleImport}
                    layout='vertical'
                >
                    <Form.Item
                        name='selectedFormat'
                        label='Import format'
                        rules={[{ required: true, message: 'Format must be selected' }]}
                    >
                        <Select placeholder='Select dataset format' className='cvat-modal-import-select'>
                            {importers
                                .sort((a: any, b: any) => a.name.localeCompare(b.name))
                                .filter(
                                    (importer: any): boolean => (
                                        instance !== null &&
                                        (!instance?.dimension || importer.dimension === instance.dimension)
                                    ),
                                )
                                .map(
                                    (importer: any): JSX.Element => {
                                        // const pending = currentImportId !== null;
                                        // FIXME
                                        const pending = false;
                                        const disabled = !importer.enabled || pending;
                                        return (
                                            <Select.Option
                                                value={importer.name}
                                                key={importer.name}
                                                disabled={disabled}
                                                className='cvat-modal-import-dataset-option-item'
                                            >
                                                <UploadOutlined />
                                                <Text disabled={disabled}>{importer.name}</Text>
                                                {pending && <LoadingOutlined style={{ marginLeft: 10 }} />}
                                            </Select.Option>
                                        );
                                    },
                                )}
                        </Select>
                    </Form.Item>
                    <Space>
                        <Form.Item
                            name='useDefaultSettings'
                        >
                            <Switch
                                defaultChecked
                                onChange={(value: boolean) => {
                                    setUseDefaultSettings(value);
                                }}
                            />
                        </Form.Item>
                        <Text strong>Use default settings</Text>
                        <Tooltip
                            title={helpMessage}
                        >
                            <QuestionCircleOutlined/>
                        </Tooltip>
                    </Space>

                    {useDefaultSettings && defaultStorageLocation === StorageLocation.LOCAL && uploadLocalFile()}
                    {!useDefaultSettings && <StorageField
                        label='Source storage'
                        description='Specify source storage for import dataset'
                        onChangeStorage={(value: Storage) => setSelectedSourceStorage(value)}
                    />}
                    {!useDefaultSettings && selectedSourceStorage?.location === StorageLocation.CLOUD_STORAGE && renderCustomName()}
                    {!useDefaultSettings && selectedSourceStorage?.location === StorageLocation.LOCAL && uploadLocalFile()}
                </Form>
            </Modal>
            {resource === 'dataset' && <ImportDatasetStatusModal />}
        </>
    );
}

export default React.memo(ImportDatasetModal);
