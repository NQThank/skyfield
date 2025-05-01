import { Form, Input } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as yup from 'yup';

import { required } from '@/app/formRules';
import { AppDatePicker, AppModal } from '@/core/components';
import { DateFormat } from '@/core/enums';
import { useForm } from '@/core/hooks';
import { JobService, ProjectService } from '@/core/services';
import { FormLayoutItem, JobMilestone, JobMilestonePayload, ModalBaseProps, ResponseCommon } from '@/core/types';

type MilestoneModalProps = ModalBaseProps<JobMilestone> & {
  count: number;
};

const schema = yup.object({
  name: yup.string().required(),
  end_date: yup.mixed().required()
});

const MilestoneModal: React.FC<MilestoneModalProps> = ({ open, onCancel, actionType, data, fetchData, count }) => {
  const { id, projectId } = useParams();
  const [project, setProject] = useState<any>();
  const location = useLocation();

  const fetchProjectId = async () => {
    if (!projectId) return;
    try {
      const res = await ProjectService.getProjectById(projectId);
      if (res?.success) setProject(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchProjectId();
  }, [projectId]);

  const { t } = useTranslation(['message']);

  const [submitting, setSubmitting] = useState(false);
  const {
    formField: { form, ...formProps }
  } = useForm({
    schema,
    async onSubmit(values) {
      if (!values || !id) return;
      try {
        let res: ResponseCommon<null> | null = null;
        const payload: JobMilestonePayload = {
          name: values.name,
          end_date: (values.end_date as Dayjs)?.format(DateFormat.YYYYMMDD) ?? '',
          order_value: actionType === 'edit' ? data?.order_value : count + 1
        };
        setSubmitting(true);
        if (actionType === 'edit' && data) {
          res = await JobService.updateMilestone(id, data.id, payload);
        } else {
          res = await JobService.addMilestone(id, payload);
        }
        if (res?.success) {
          toast.success(t('success'));
          fetchData?.();
          onCancel();
        }
      } finally {
        setSubmitting(false);
      }
    }
  });
  const [formLayoutItem] = useState<FormLayoutItem>({ labelCol: { span: 6 }, wrapperCol: { span: 18 } });

  const title = useMemo(() => `${actionType === 'edit' ? 'Update' : 'Add'} Milestone`, [actionType]);

  useEffect(() => {
    if (actionType === 'edit' && open && data) {
      form.setFieldsValue({
        name: data.name,
        end_date: dayjs(data.end_date) ?? null
      });
    }
  }, [actionType, form, open, data]);

  const onOk = () => {
    form.submit();
  };
  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      title={title}
      maskClosable={false}
      afterClose={() => form.resetFields()}
      confirmLoading={submitting}
    >
      <Form form={form} {...formProps} {...formLayoutItem} size="large" labelAlign="left" colon={false}>
        <Form.Item label={'Name'} name={'name'} rules={[required]}>
          <Input placeholder="Name" />
        </Form.Item>
        <Form.Item
          label={'End Date'}
          name={'end_date'}
          rules={!location.pathname.includes('/job-templates/') ? [required] : []}
        >
          <AppDatePicker
            startDate={dayjs(project?.forecast_start_date, 'YYYYMMDD')}
            endDate={dayjs(project?.forecast_end_date, 'YYYYMMDD')}
            className="w-full"
          />
        </Form.Item>
      </Form>
    </AppModal>
  );
};

export default MilestoneModal;
