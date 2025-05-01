import { Form, Input, InputNumber, Radio, Select } from 'antd';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as yup from 'yup';

import { AppModal, AppSelect } from '@/core/components';
import { CustomerStatus } from '@/core/constants';
import { useForm } from '@/core/hooks';
import { CommonService, CustomerService } from '@/core/services';
import { Customer, CustomerStatusType, Market, ModalBaseProps, ResponseCommon } from '@/core/types';
import { CommonHelper, FormatHelper } from '@/utils/helpers';

type CustomerModalProps = ModalBaseProps<Customer>;

const schema = yup.object({
  name: yup.string().required(),
  address: yup.string().required(),
  website: yup.string().required(),
  contact_name: yup.string().required(),
  contact_phone: yup
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
  contact_email: yup.string().email().required(),
  status: yup.string().oneOf<CustomerStatusType>(['active', 'disabled', 'inactive', 'pending']).required(),
  // contract_status: yup.string().oneOf<CustomerStatusType>(['active', 'disabled', 'inactive', 'pending']).required(),
  net_term: yup.number().nullable(),
  market_ids: yup.array().of(yup.string().required())
});

type CustomerForm = yup.InferType<typeof schema>;

const CustomerModal: React.FC<CustomerModalProps> = ({ open, onCancel, data, actionType, fetchData }) => {
  const { t } = useTranslation(['message', 'button']);
  const [submitting, setSubmitting] = useState(false);

  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    formField: { form, ...props }
  } = useForm<CustomerForm>({
    schema: schema,
    onSubmit: async (values) => {
      if (!values) return;
      try {
        setSubmitting(true);
        let res: ResponseCommon<null> | null = null;
        if (actionType === 'add') {
          res = await CustomerService.addCustomer(values);
        } else if (actionType === 'edit' && data) {
          res = await CustomerService.updateCustomer(data.id, values);
        }
        if (res?.success) {
          toast.success(t('success'));
          onCancel();
          fetchData?.();
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    if (actionType === 'edit' && open && data) {
      form.setFieldsValue({ ...data });
    }
  }, [actionType, open, data, form]);

  // init select
  useEffect(() => {
    open && onSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onOk = () => {
    form.submit();
  };

  const formLayoutItem = useMemo(
    () => ({
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 16
      }
    }),
    []
  );

  const okText = useMemo(() => {
    return actionType === 'edit' ? t(['button:update']) : t(['button:add']);
  }, [actionType, t]);

  const title = useMemo(() => {
    return `${okText} Customer`;
  }, [okText]);

  const onChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = FormatHelper.formatPhoneNumber(e.target.value);
    form.setFieldValue('contact_phone', phoneNumber);
  };

  const fetchMarkets = useCallback(async (value: string) => {
    setLoading(true);
    try {
      const res = await CommonService.getMarkets(value);
      if (res.success) {
        setMarkets(res.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = (value: string) => {
    CommonHelper.debounceFn(value, fetchMarkets);
  };

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      okText={okText}
      title={title}
      onOk={onOk}
      confirmLoading={submitting}
      width={650}
      afterClose={() => form.resetFields()}
    >
      <Form
        {...props}
        form={form}
        {...formLayoutItem}
        labelAlign="left"
        colon={false}
        initialValues={{
          status: 'active'
          // contract_status: 'active'
        }}
      >
        <Form.Item label="Name" name={'name'} required>
          <Input placeholder="Name" />
        </Form.Item>
        <Form.Item label="Address" name={'address'} required>
          <Input placeholder="Address" />
        </Form.Item>
        <Form.Item label="Website" name={'website'} required>
          <Input placeholder="Website" />
        </Form.Item>
        <Form.Item label="Contact Name" name={'contact_name'} required>
          <Input placeholder="Contact Name" />
        </Form.Item>
        <Form.Item label="Contact Phone" name={'contact_phone'} required>
          <Input placeholder="(XXX) XXX-XXXX" onChange={onChangePhoneNumber} />
        </Form.Item>
        <Form.Item label="Contact Email" name={'contact_email'} required>
          <Input placeholder="Contact Email" />
        </Form.Item>
        <Form.Item label="Market" name={'market_ids'}>
          <AppSelect
            placeholder="Market"
            showSearch
            filterOption={false}
            onSearch={onSearch}
            loading={loading}
            mode="multiple"
          >
            {markets.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </AppSelect>
        </Form.Item>
        <Form.Item label="Status" name={'status'} required>
          <Radio.Group buttonStyle="solid" optionType="button" options={CustomerStatus} />
        </Form.Item>
        {/* <Form.Item label="Contact Status" name={'contract_status'} required>
          <Radio.Group buttonStyle="solid" optionType="button" options={CustomerStatus} />
        </Form.Item> */}
        <Form.Item label="Net Term" name={'net_term'}>
          <InputNumber placeholder="Net Term" className="w-full" min={0} />
        </Form.Item>
      </Form>
    </AppModal>
  );
};

export default memo(CustomerModal);
