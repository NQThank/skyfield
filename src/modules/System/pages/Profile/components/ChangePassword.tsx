import { Card, Form, Input } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as yup from 'yup';

import { AppButton } from '@/core/components';
import { LocalStorageKeyEnum } from '@/core/enums';
import { useAppDispatch, useForm } from '@/core/hooks';
import { MeService } from '@/core/services';
import { setUser } from '@/modules/Authentication/pages/Login/auth.slice';
import { StorageHelper } from '@/utils/helpers';
import { FormLayoutItem } from '@/core/types';

type ChangePasswordProps = {};

const schema = yup.object({
  old_password: yup.string().required(),
  new_password: yup.string().required(),
  confirm_new_password: yup
    .string()
    .required()
    .test('passwords-match', 'Passwords not match', function (value) {
      return this.parent['new_password'] === value;
    })
});

type ChangePasswordForm = yup.InferType<typeof schema>;

const ChangePassword: React.FC<ChangePasswordProps> = () => {
  const dispatch = useAppDispatch();

  const { t } = useTranslation(['message', 'button']);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    formField: { form, ...props }
  } = useForm<ChangePasswordForm>({
    schema,
    async onSubmit(data) {
      if (!data) return;
      try {
        setLoading(true);
        const res = await MeService.changePassword(data);
        if (res.success) {
          toast.success(t(['change password']));
          StorageHelper.remove(LocalStorageKeyEnum.auth);
          dispatch(setUser(null));
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    }
  });
  const [formLayoutItem] = useState<FormLayoutItem>({ labelCol: { span: 6, offset: 0 }, wrapperCol: { span: 18 } });

  return (
    <Card hoverable>
      <div className="flex w-full justify-center">
        <div className="w-full ">
          <Form
            {...formLayoutItem}
            form={form}
            {...props}
            labelAlign="left"
            layout="horizontal"
            colon={false}
            size="large"
          >
            <Form.Item className=" items-center" label="Old Password" name={'old_password'} required>
              <Input.Password placeholder="Old Password" />
            </Form.Item>
            <Form.Item label="New Password" name={'new_password'} required>
              <Input.Password placeholder="Password minimum 8 characters" />
            </Form.Item>
            <Form.Item label="Confirm New Password" name={'confirm_new_password'} required>
              <Input.Password placeholder="Confirm New Password" />
            </Form.Item>
            <Form.Item wrapperCol={{ span: 6, offset: 6 }}>
              <AppButton className="w-28" block type="primary" htmlType="submit" loading={loading}>
                {t(['button:change_password'])}
              </AppButton>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Card>
  );
};

export default ChangePassword;
