import { Form, Input, Select } from 'antd';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as yup from 'yup';

import { AppModal, AppSelect } from '@/core/components';
import { useForm } from '@/core/hooks';
import { TeamService } from '@/core/services';
import { EmployeePM, ModalBaseProps, ResponseCommon, Team } from '@/core/types';
import { CommonHelper, LogHelper } from '@/utils/helpers';

type TeamModalProps = ModalBaseProps<Team>;

const schema = yup.object({
  name: yup.string().required(),
  pm_id: yup.string().required()
});

type TeamForm = yup.InferType<typeof schema>;

const TeamModal: React.FC<TeamModalProps> = ({ open, onCancel, actionType, data, fetchData }) => {
  const { t } = useTranslation(['message']);

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pms, setPms] = useState<EmployeePM[]>([]);

  const {
    formField: { form, ...props }
  } = useForm<TeamForm>({
    schema: schema,
    onSubmit: async (values) => {
      if (!values) return;
      try {
        setSubmitting(true);
        let res: ResponseCommon<null> | null = null;
        if (actionType === 'add') {
          res = await TeamService.addTeam(values);
        } else if (actionType === 'edit' && data) {
          res = await TeamService.updateTeam(data.id, values);
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

  // init select
  useEffect(() => {
    open && onSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const formLayoutItem = useMemo(() => ({ labelCol: { span: 6 }, wrapperCol: { span: 18 } }), []);

  const title = useMemo(() => {
    return `${actionType === 'add' ? 'Add' : 'Update'} Team`;
  }, [actionType]);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({ ...data });
      setPms([
        {
          id: data.pm_id,
          name: data?.pm_name ?? ''
        }
      ]);
    }
  }, [open, data, form]);

  const fetchPms = useCallback(async (name: string) => {
    try {
      setLoading(true);
      const res = await TeamService.getPmsList({ q: name });
      if (res.success) {
        setPms(res.data ?? []);
      }
    } catch (error) {
      LogHelper.logError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = (value: string) => {
    CommonHelper.debounceFn(value, fetchPms);
  };

  const onOk = () => {
    form.submit();
  };
  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={submitting}
      title={title}
      afterClose={() => form.resetFields()}
    >
      <Form form={form} {...props} {...formLayoutItem} labelAlign="left">
        <Form.Item label="Team Name" name={'name'} required>
          <Input placeholder="Team Name" />
        </Form.Item>
        <Form.Item label="Leader" name={'pm_id'} required>
          <AppSelect
            placeholder="Choose Leader"
            loading={loading}
            allowClear
            showSearch
            onSearch={onSearch}
            filterOption={false}
          >
            {pms.map((pm) => (
              <Select.Option key={pm.id} value={pm.id}>
                {pm.name}
              </Select.Option>
            ))}
          </AppSelect>
        </Form.Item>
      </Form>
    </AppModal>
  );
};

export default memo(TeamModal);
