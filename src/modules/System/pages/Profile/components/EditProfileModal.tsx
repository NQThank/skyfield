import { PlusOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Upload, UploadFile } from 'antd';
import { RcFile } from 'antd/es/upload';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as yup from 'yup';

import { useForm } from '@/core/hooks';
import { MeService } from '@/core/services';
import { Employee, ModalBaseProps } from '@/core/types';
import { CommonHelper, DataHelper, FileHelper, FormatHelper } from '@/utils/helpers';

type EditProfileModalProps = ModalBaseProps<Employee>;

const schema = yup.object({
  first_name: yup.string(),
  middle_name: yup.string(),
  last_name: yup.string(),
  address: yup.string(),
  phone: yup
    .string()
    .label('Phone Number')
    .test({
      test: (value) => {
        if (!value) return true;
        return CommonHelper.isValidPhoneNumber(value);
      },
      message: 'Phone number is invalid'
    }),
  avatar: yup.array().of(yup.mixed<UploadFile>())
});

type ProfileForm = yup.InferType<typeof schema>;

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onCancel, data, fetchData }) => {
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();

  const {
    formField: { form, ...propsForm }
  } = useForm<ProfileForm>({
    schema,
    async onSubmit(data) {
      if (!data) return;
      setSubmitting(true);
      try {
        if (data.avatar) {
          const formData = new FormData();
          formData.append('file', data.avatar[0]?.originFileObj as Blob);
          await MeService.updateAvatar(formData);
        }
        const res = await MeService.updateProfile(data);
        if (res.success) {
          onCancel();
          fetchData?.();
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  const avatar = Form.useWatch('avatar', form);

  useEffect(() => {
    if (avatar?.[0]?.originFileObj) {
      FileHelper.getBase64(avatar[0]?.originFileObj, (url) => {
        setImageUrl(url);
      });
    }
  }, [avatar]);

  const onChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = FormatHelper.formatPhoneNumber(e.target.value);
    form.setFieldValue('phone', phoneNumber);
  };

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({ ...data });
      if (data.avatar_path) {
        setImageUrl(DataHelper.getUrlFile(data.avatar_path));
      }
    }
  }, [data, form, open]);

  const onOk = () => {
    form.submit();
  };
  const normFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      toast.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      toast.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      confirmLoading={submitting}
      title="Update Profile"
      afterClose={() => form.resetFields()}
      onOk={onOk}
    >
      <Form form={form} {...propsForm} layout="vertical">
        <Form.Item name="avatar" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload
            accept="image/*"
            maxCount={1}
            listType="picture-circle"
            className="text-center"
            showUploadList={false}
            beforeUpload={beforeUpload}
            customRequest={() => {}}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="avatar" className="h-full w-full rounded-full object-contain shadow-lg" />
            ) : (
              uploadButton
            )}
          </Upload>
        </Form.Item>
        <Form.Item label="First Name" name={'first_name'}>
          <Input placeholder="First Name" />
        </Form.Item>
        <Form.Item label="Middle Name" name={'middle_name'}>
          <Input placeholder="Middle Name" />
        </Form.Item>
        <Form.Item label="Last Name" name={'last_name'}>
          <Input placeholder="Last Name" />
        </Form.Item>
        <Form.Item label="Phone" name={'phone'}>
          <Input placeholder="(XXX) XXX-XXXX" onChange={onChangePhoneNumber} />
        </Form.Item>
        <Form.Item label="Address" name={'address'}>
          <Input placeholder="Address" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
