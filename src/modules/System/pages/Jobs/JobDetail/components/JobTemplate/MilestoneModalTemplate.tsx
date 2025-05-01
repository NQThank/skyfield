import { Form, Input } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as yup from 'yup';

import { required } from '@/app/formRules';
import { AppModal } from '@/core/components';
import { useForm } from '@/core/hooks';
import { FormLayoutItem, JobMilestone, ModalBaseProps } from '@/core/types';
import { CommonHelper } from '@/utils/helpers';
import { ListAddMilestone } from './CardMilestoneTemplate';
import { MileStoneType } from '@/modules/System/pages/JobTemplateForm';

type MilestoneModalProps = ModalBaseProps<JobMilestone> & {
  count: number;
  list: ListAddMilestone;
};

const schema = yup.object({
  name: yup.string().required()
  // end_date: yup.mixed().required()
});

const MilestoneModalTemplate: React.FC<MilestoneModalProps> = ({ open, onCancel, actionType, data, list }) => {
  const { t } = useTranslation(['message']);

  const [submitting, setSubmitting] = useState(false);
  const {
    formField: { form, ...formProps }
  } = useForm({
    schema,
    async onSubmit(values) {
      if (!values) return;
      try {
        // const formattedEndDate = (values.end_date as Dayjs)?.format(DateFormat.YYYYMMDD) ?? '';
        const newMilestone = {
          id: actionType === 'add' ? CommonHelper.generateStr() : data?.id || CommonHelper.generateStr(),
          name: values.name
          // end_date: formattedEndDate
          // order_value: id ? data?.order_value : count + 1
        };

        if (actionType === 'add') {
          const completeMilestone = { ...newMilestone, job_tasks: [] };
          list.setMilestone(
            list.milestone
              ? [...list.milestone, completeMilestone as MileStoneType]
              : [completeMilestone as MileStoneType]
          );
        } else {
          if (!data) return;
          list.setMilestone(list.milestone.map((e: any) => (e.id === data.id ? { ...e, name: newMilestone.name } : e)));
        }

        toast.success(t('success'));
        onCancel();
      } finally {
        setSubmitting(false);
      }
    }
  });
  const [formLayoutItem] = useState<FormLayoutItem>({ labelCol: { span: 6 }, wrapperCol: { span: 18 } });

  const title = useMemo(() => `${actionType === 'add' ? 'Add' : 'Edit'} Milestone`, [actionType]);

  useEffect(() => {
    if (actionType === 'edit' && open && data) {
      form.setFieldsValue({
        name: data.name
        // end_date: dayjs(data.end_date) ?? null
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
        {/* <Form.Item
          label={'End Date'}
          name={'end_date'}
          rules={!location.pathname.includes('/job-templates/') ? [required] : []}
        >
          <AppDatePicker className="w-full" />
        </Form.Item> */}
      </Form>
    </AppModal>
  );
};

export default MilestoneModalTemplate;
