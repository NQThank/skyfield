import { Form, Input, Select } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as yup from 'yup';

import { AppModal } from '@/core/components';
import { useForm } from '@/core/hooks';
import { ContactService } from '@/core/services';
import { FormLayoutItem, ModalBaseProps, ResponseCommon } from '@/core/types';
import { ContactRoleStatus } from '@/core/constants';
import { CommonHelper } from '@/utils/helpers';
import { Contact } from '@/core/types/contact.type';

type ContactModalProps = ModalBaseProps<Contact>;

const schema = yup.object({
  customer_name: yup.string().required(),
  phone_number: yup
    .string()
    .label('Phone Number')
    .test({
      test: (value) => {
        if (!value) return true;
        return CommonHelper.isValidPhoneNumber(value);
      },
      message: 'Phone number is invalid'
    })
    .required(),
  email: yup.string().email().required(),
  role: yup.string().required(),
  company_name: yup.string().required()
});

type ContactForm = yup.InferType<typeof schema>;

const ContactModal: React.FC<ContactModalProps> = ({ open, onCancel, actionType, data, fetchData }) => {
  const { t } = useTranslation(['message']);
  const [loading, setLoading] = useState(false);

  const [formLayoutItem] = useState<FormLayoutItem>({
    labelCol: { span: 8 },
    wrapperCol: {
      span: 16
    }
  });
  const {
    formField: { form, ...props }
  } = useForm<ContactForm>({
    schema,
    onSubmit: async (values) => {
      if (!values) return;
      let res: ResponseCommon<null> | null = null;
      setLoading(true);
      try {
        if (actionType === 'add') {
          res = await ContactService.addContact(values);
        } else if (actionType === 'edit' && data) {
          res = await ContactService.updateContact(data.id, values);
        }
        if (res?.success) {
          toast.success(t(['success']));
          fetchData?.();
          onCancel();
        }
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (open && actionType === 'edit' && data) {
      form.setFieldsValue({ ...data, company_name: data?.company });
    }
  }, [actionType, form, data, open]);

  const title = useMemo(() => `${actionType === 'add' ? 'Add' : 'Edit'} Contact`, [actionType]);

  const onOk = () => {
    form.submit();
  };

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      title={title}
      confirmLoading={loading}
      afterClose={() => form.resetFields()}
    >
      <Form form={form} {...props} {...formLayoutItem} labelAlign="left" colon={false} labelWrap>
        <Form.Item label="Customer Name" name={'customer_name'} required>
          <Input placeholder="Customer Name" />
        </Form.Item>
        <Form.Item label="Phone Number" name={'phone_number'} required>
          <Input placeholder="Phone Number" />
        </Form.Item>
        <Form.Item label="Email" name={'email'} required>
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item label="Role" name={'role'} required>
          <Select placeholder="Role" options={ContactRoleStatus} />
        </Form.Item>
        <Form.Item label="Company Name" name={'company_name'} required>
          <Input placeholder="Company Name" />
        </Form.Item>
      </Form>
    </AppModal>
  );
};

export default ContactModal;
