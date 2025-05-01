import { Form, Input } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as yup from 'yup';

import { AppModal, AppSelect } from '@/core/components';
import { useForm } from '@/core/hooks';
import { ContactService, MarketService } from '@/core/services';
import { Contact, FormLayoutItem, Market, ModalBaseProps, ResponseCommon } from '@/core/types';

type MarketModalProps = ModalBaseProps<Market>;

const schema = yup.object({
  name: yup.string().required(),
  wireless_carrier: yup.string(),
  carrier_address: yup.string(),
  carrier_logistic_location: yup.string(),
  notes: yup.string(),
  contact: yup.array().of(yup.string())
});

type MarketForm = yup.InferType<typeof schema>;

const MarketModal: React.FC<MarketModalProps> = ({ open, onCancel, actionType, data, fetchData }) => {
  const { t } = useTranslation(['message']);
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState<Contact[]>([]);

  const [formLayoutItem] = useState<FormLayoutItem>({
    labelCol: { span: 8 },
    wrapperCol: {
      span: 16
    }
  });
  const {
    formField: { form, ...props }
  } = useForm<MarketForm>({
    schema,
    onSubmit: async (values) => {
      if (!values) return;
      let res: ResponseCommon<null> | null = null;
      setLoading(true);
      try {
        if (actionType === 'add') {
          res = await MarketService.addMarket(values);
        } else if (actionType === 'edit' && data) {
          res = await MarketService.updateMarket(data.id, values);
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
  const fetchContact = async () => {
    try {
      const res = await ContactService.getContactList({ page_size: 100, page_number: 1 });
      if (res?.success) {
        setContact(res.data || []);
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  useEffect(() => {
    fetchContact();
  }, []);

  useEffect(() => {
    if (open && actionType === 'edit' && data) {
      form.setFieldsValue({ ...data });
    }
  }, [actionType, form, data, open]);

  const title = useMemo(() => `${actionType === 'add' ? 'Add' : 'Edit'} Market`, [actionType]);

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
        <Form.Item label="Name" name={'name'} required>
          <Input placeholder="Name" />
        </Form.Item>
        <Form.Item label="Contact" name={'contact'}>
          <AppSelect
            placeholder="Customer name"
            showSearch
            filterOption={false}
            mode="multiple"
            options={contact.map((item) => ({ label: item.customer_name, value: item.id }))}
            loading={loading}
            allowClear
          />
        </Form.Item>
        <Form.Item label="Wireless Carrier" name={'wireless_carrier'}>
          <Input placeholder="Wireless Carrier" />
        </Form.Item>
        <Form.Item label="Carrier Address" name={'carrier_address'}>
          <Input placeholder="Carrier Address" />
        </Form.Item>
        <Form.Item label="Carrier Logistic Location" name={'carrier_logistic_location'}>
          <Input placeholder="Carrier Logistic Location" />
        </Form.Item>
        <Form.Item label="Notes" name={'notes'}>
          <Input placeholder="Notes" />
        </Form.Item>
      </Form>
    </AppModal>
  );
};

export default MarketModal;
