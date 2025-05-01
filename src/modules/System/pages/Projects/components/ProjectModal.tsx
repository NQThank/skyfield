import { DatePickerProps, Form, Input, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as yup from 'yup';

import { required } from '@/app/formRules';
import { AppDatePicker, AppModal, AppSelect } from '@/core/components';
import { DateFormat } from '@/core/enums';
import { useForm } from '@/core/hooks';
import { CommonService, MarketService, ProjectService } from '@/core/services';
import { Customer, Market, ModalBaseProps, Project, ProjectPayload, ResponseCommon } from '@/core/types';
import { LogHelper } from '@/utils/helpers';

type ProjectModalProps = ModalBaseProps<Project>;

const schema = yup.object({
  name: yup.string().required(),
  customer_id: yup.string().required(),
  market_id: yup.array().of(yup.string()),
  description: yup.string(),
  forecast_start_date: yup.mixed().required(),
  forecast_end_date: yup.mixed().required()
});

type ProjectForm = yup.InferType<typeof schema>;

const ProjectModal: React.FC<ProjectModalProps> = ({ open, onCancel, actionType, fetchData, data }) => {
  const { t } = useTranslation(['message']);
  const [markets, setMarkets] = useState<Market[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const {
    formField: { form, ...props }
  } = useForm<ProjectForm>({
    schema: schema,
    onSubmit: async (values) => {
      if (!values) return;
      try {
        setSubmitting(true);
        const payload: ProjectPayload = {
          ...values,
          forecast_start_date: (values.forecast_start_date as Dayjs)?.format(DateFormat.YYYYMMDD),
          forecast_end_date: (values.forecast_end_date as Dayjs)?.format(DateFormat.YYYYMMDD),
          market_id: values.market_id || null
        };
        let res: ResponseCommon<null> | null = null;
        if (actionType === 'add') {
          res = await ProjectService.addProject(payload);
        } else if (actionType === 'edit' && data) {
          res = await ProjectService.updateProject(data.id, payload);
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
  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MarketService.getMarketList({ page_size: 100, page_number: 1 });
      if (res.success) {
        setMarkets(res.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // init select

  const formLayoutItem = useMemo(() => ({ labelCol: { span: 6 }, wrapperCol: { span: 18 } }), []);

  const fetchCustomer = useCallback(async (name: string) => {
    try {
      setLoading(true);
      const res = await CommonService.getCustomers(name);
      if (res.success) {
        setCustomers(res.data ?? []);
      }
    } catch (error) {
      LogHelper.logError(error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await ProjectService.getProjectById(data?.id);
        if (res.success) {
          console.log(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (actionType === 'edit' && data?.id) {
      fetchProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (open) {
      fetchCustomer('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (actionType === 'edit' && data) {
      form.setFieldsValue({
        customer_id: data.customer_id,
        description: data.description ?? '',
        forecast_end_date: dayjs(data.forecast_end_date),
        forecast_start_date: dayjs(data.forecast_start_date),
        name: data.name ?? '',
        market_id: data.market_id || null
      });
    }
    fetchMarkets();
  }, [actionType, data, fetchMarkets, form]);

  const title = useMemo(() => {
    return actionType === 'edit' ? 'Update Project' : 'Add Project';
  }, [actionType]);

  const okText = useMemo(() => {
    return actionType === 'edit' ? 'Save' : 'Add';
  }, [actionType]);

  // handle disabled start date
  const disabledStartDate: DatePickerProps<Dayjs>['disabledDate'] = (currentDate) => {
    if (!currentDate) return false;
    const endDate: Dayjs | undefined = form.getFieldValue('forecast_end_date');
    if (!endDate) return false;
    return dayjs(currentDate.startOf('d') as Dayjs)?.isSameOrAfter(endDate.startOf('day'));
  };

  // handle disabled end date
  const disabledEndDate: DatePickerProps['disabledDate'] = (currentDate) => {
    const startDate: Dayjs | undefined = form.getFieldValue('forecast_start_date');
    if (!startDate) return false;
    return dayjs(currentDate.startOf('day') as Dayjs)?.isSameOrBefore(startDate.startOf('day'));
  };

  const onOk = () => {
    form.submit();
  };

  const onValuesChange = (changedValues: ProjectForm) => {
    if (Object.keys(changedValues).includes('customer_id')) {
      if (changedValues.customer_id) fetchMarkets(changedValues.customer_id);
      else setMarkets([]);
      form.resetFields(['market_id']);
    }
  };

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      title={title}
      okText={okText}
      actionType={actionType}
      confirmLoading={submitting}
      onOk={onOk}
      afterClose={() => form.resetFields()}
    >
      <Form
        form={form}
        {...props}
        {...formLayoutItem}
        size="middle"
        labelAlign="left"
        colon={false}
        onValuesChange={onValuesChange}
      >
        <Form.Item label="Project Name" name={'name'} rules={[required]}>
          <Input placeholder="Project Name" />
        </Form.Item>
        <Form.Item label="Start Date" name={'forecast_start_date'} rules={[required]}>
          <AppDatePicker className="w-full" disabledDate={disabledStartDate} format={DateFormat['MM/DD/YYYY']} />
        </Form.Item>
        <Form.Item label="End Date" name={'forecast_end_date'} rules={[required]}>
          <AppDatePicker className="w-full" disabledDate={disabledEndDate} format={DateFormat['MM/DD/YYYY']} />
        </Form.Item>
        <Form.Item label="Customer" name={'customer_id'} rules={[required]}>
          <AppSelect showSearch filterOption={false} loading={loading} placeholder="Select Customer">
            {customers.map((customer) => (
              <Select.Option key={customer.id} value={customer.id}>
                {customer.name}
              </Select.Option>
            ))}
          </AppSelect>
        </Form.Item>
        <Form.Item label="Market" name={'market_id'}>
          <AppSelect
            placeholder="Select Market"
            showSearch
            mode="multiple"
            filterOption={false}
            options={markets.map((item) => ({ label: item.name, value: item.id }))}
            loading={loading}
          />
        </Form.Item>
        <Form.Item label="Description" name={'description'}>
          <Input.TextArea placeholder="Description" />
        </Form.Item>
      </Form>
    </AppModal>
  );
};
export default ProjectModal;
