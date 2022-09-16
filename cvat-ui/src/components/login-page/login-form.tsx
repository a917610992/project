// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

export interface LoginData {
    username: string;
    password: string;
}

interface Props {
    fetching: boolean;
    onSubmit(loginData: LoginData): void;
}

function LoginFormComponent(props: Props): JSX.Element {
    const { fetching, onSubmit } = props;
    return (
        <Form onFinish={onSubmit} className='login-form'>
            <Form.Item
                hasFeedback
                name='username'
                rules={[
                    {
                        required: true,
                        message: '请指定用户名',
                    },
                ]}
            >
                <Input
                    autoComplete='username'
                    prefix={<UserOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
                    placeholder='用户名'
                />
            </Form.Item>

            <Form.Item
                hasFeedback
                name='password'
                rules={[
                    {
                        required: true,
                        message: '请指定密码',
                    },
                ]}
            >
                <Input
                    autoComplete='current-password'
                    prefix={<LockOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
                    placeholder='密码'
                    type='password'
                />
            </Form.Item>

            <Form.Item>
                <Button
                    type='primary'
                    loading={fetching}
                    disabled={fetching}
                    htmlType='submit'
                    className='login-form-button'
                >
                    登录
                </Button>
            </Form.Item>
        </Form>
    );
}

export default React.memo(LoginFormComponent);
