// Copyright (c) 2022 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';
import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'antd/lib/modal';
import Notification from 'antd/lib/notification';
import { useSelector, useDispatch } from 'react-redux';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import Text from 'antd/lib/typography/Text';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Form, { FormInstance } from 'antd/lib/form';

import { CombinedState, StorageLocation, Storage } from 'reducers/interfaces';
import { exportActions, exportBackupAsync } from 'actions/export-actions';
import getCore from 'cvat-core-wrapper';
import Switch from 'antd/lib/switch';
import { Space } from 'antd';

import StorageForm from 'components/storage/storage-form';

const core = getCore();

type FormValues = {
    customName: string | undefined;
};

function ExportBackupModal(): JSX.Element | null {
    const dispatch = useDispatch();

    const [instanceType, setInstanceType] = useState('');

    const [activity, setActivity] = useState(false);
    const [form] = Form.useForm();

    const [useDefaultStorage, setUseDefaultStorage] = useState(true);
    const [defaultStorageLocation, setDefaultStorageLocation] = useState<string | null>(null);
    const [defaultStorageCloudId, setDefaultStorageCloudId] = useState<number | null>(null);
    const [storage, setStorage] = useState<Storage | null>(null);

    const storageForm = React.createRef<FormInstance>();

    const [helpMessage, setHelpMessage] = useState('');
    const resource = useSelector((state: CombinedState) => state.export.resource);
    const instance = useSelector((state: CombinedState) => state.export.instance);
    const modalVisible = useSelector((state: CombinedState) => state.export.modalVisible);
    const { tasks: taskExportActivities, projects: projectExportActivities } = useSelector((state: CombinedState) => state.export);

    const initActivities = (): void => {
        if (resource === 'backup') {
            let activity = false;
            if (instance instanceof core.classes.Project) {
                setInstanceType(`project #${instance.id}`);
                if (projectExportActivities[instance?.id]) {
                    activity = projectExportActivities[instance?.id].backup;
                }
                setActivity(activity);
            } else if (instance instanceof core.classes.Task) {
                setInstanceType(`task #${instance.id}`);
                if (taskExportActivities[instance?.id]) {
                    activity = taskExportActivities[instance?.id].backup;
                }
            }
        }
    };

    useEffect(() => {
        initActivities();
    }, [instance?.id, resource, instance instanceof core.classes.Project, taskExportActivities, projectExportActivities]);


    useEffect(() => {
        if (instance && resource === 'backup') {
            setDefaultStorageLocation((instance.targetStorage) ?
                instance.targetStorage.location : null);
            setDefaultStorageCloudId((instance.targetStorage) ?
                instance.targetStorage.cloud_storage_id
            : null);
        }
    }, [instance?.id, resource, instance?.targetStorage]);

    useEffect(() => {
        setHelpMessage(
            `Export backup to ${(defaultStorageLocation) ? defaultStorageLocation.split('_')[0] : 'local'} ` +
            `storage ${(defaultStorageCloudId) ? '№' + defaultStorageCloudId : ''}`);
    }, [defaultStorageLocation, defaultStorageCloudId]);

    const closeModal = (): void => {
        storageForm.current?.resetFields();
        form.resetFields();
        dispatch(exportActions.closeExportModal());
    };

    const handleExport = useCallback(
        (values: FormValues): void => {
            dispatch(
                exportBackupAsync(
                    instance,
                    values.customName ? `${values.customName}.zip` : '',
                    (useDefaultStorage) ? null : {
                        location: storage?.location,
                        cloudStorageId: storage?.cloudStorageId,
                    } as Storage,
                ),
            );
            closeModal();
            Notification.info({
                message: 'Backup export started',
                description:
                    `Backup export was started. ` +
                    'Download will start automatically as soon as the file is ready.',
                className: `cvat-notification-notice-export-backup-start`,
            });
        },
        [instance, instanceType, storage],
    );

    const onChangeStorage = (value: Storage): void => {
        setStorage({
            ...value,
        } as Storage)
    }

    if (resource !== 'backup') return null;

    return (
        // TODO add pending on submit buttom
        <Modal
            title={<Text strong>{`Export ${instanceType}`}</Text>}
            visible={modalVisible}
            onCancel={closeModal}
            onOk={() => form.submit()}
            className={`cvat-modal-export-${instanceType.split(' ')[0]}`}
            destroyOnClose
        >
            <Form
                name={`Export ${instanceType}`}
                form={form}
                layout='vertical'
                // labelCol={{ span: 8 }}
                // wrapperCol={{ span: 16 }}
                initialValues={
                    {
                        customName: undefined,
                    } as FormValues
                }
                onFinish={handleExport}
            >
                {/* wrapperCol={{ offset: 8, span: 16 }} */}
                {/*valuePropName='checked'*/}

                <Form.Item label={<Text strong>Custom name</Text>} name='customName'>
                    <Input
                        placeholder='Custom name for a backup file'
                        suffix='.zip'
                        className='cvat-modal-export-filename-input'
                    />
                </Form.Item>
                <StorageForm
                    formRef={storageForm}
                    // FIXME rename to instanse?
                    storageLabel='Target storage'
                    projectId={instance?.id}
                    switchDescription='Use default settings'
                    switchHelpMessage={helpMessage}
                    useProjectStorage={useDefaultStorage}
                    storageDescription={`Specify target storage for export ${instanceType}`}
                    onChangeUseProjectStorage={(value: boolean) => setUseDefaultStorage(value)}
                    onChangeStorage={(value: Storage) => onChangeStorage(value)}
                />
            </Form>
        </Modal>
    );
}

export default React.memo(ExportBackupModal);
