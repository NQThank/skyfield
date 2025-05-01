import { Form, Image, Input } from 'antd';
import { AxiosError } from 'axios';
import { clsx } from 'clsx';
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { email, required } from '@/app/formRules';
import PathURL from '@/core/class/PathURL';
import { AppButton, Box } from '@/core/components';
import { LocalStorageKeyEnum } from '@/core/enums';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { AuthService } from '@/core/services';
import { LoginPayload, ResponseCommon } from '@/core/types';
import { CommonHelper, StorageHelper } from '@/utils/helpers';
import { setUser } from './auth.slice';

import LogoLogin from '@/assets/images/skynet_logo.png';
import styles from '@/styles/pages/_login.module.scss';

const Login: React.FC = () => {
  const [form] = Form.useForm<LoginPayload>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  if (user) {
    return <Navigate to={`/${PathURL.dashboard}`} />;
  }

  const onFinish = async (values: LoginPayload) => {
    try {
      setLoading(true);
      const res = await AuthService.login(values);
      if (res.success) {
        StorageHelper.setItem(LocalStorageKeyEnum.auth, res.data);
        dispatch(setUser(res.data ?? null));
        toast.success('Login successfully!!');
        navigate('/');
      }
    } catch (err) {
      const error: AxiosError<ResponseCommon<null>> = err as any;

      CommonHelper.handleError(error.response?.data);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={clsx(' h-screen w-screen bg-gray-100', styles['login-page'])}>
      <div className="mx-auto w-[480px] pt-8">
        <div className="mt-32 flex flex-col items-center gap-y-4">
          <Image preview={false} src={LogoLogin} width={96} />
          <Box>
            <div className="flex flex-col items-center">
              <h1 className="mb-2 text-3xl font-bold">Login</h1>
              <h2 className="text-xl font-bold text-gray-500">Access to your dashboard</h2>
              <Form form={form} layout="vertical" size="large" className="w-full" onFinish={onFinish}>
                <Form.Item label="Email" name={'email'} rules={[required, email]} required={false}>
                  <Input placeholder="Email" />
                </Form.Item>
                <Form.Item label="Password" name={'password'} rules={[required]} required={false}>
                  <Input.Password placeholder="Password" />
                </Form.Item>
                <AppButton
                  block
                  className="!bg-gradient-to-r from-gradient-from to-gradient-to !text-white"
                  htmlType="submit"
                  loading={loading}
                >
                  Login
                </AppButton>
              </Form>
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Login;
