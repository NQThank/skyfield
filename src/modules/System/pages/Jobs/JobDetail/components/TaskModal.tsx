import { Col, Divider, Form, Input, Row, Select } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as yup from 'yup';

import { AppDatePicker, AppModal, AppSelect } from '@/core/components';
import { LocationTypes, Priorities } from '@/core/constants';
import { LocationTypeEnum } from '@/core/enums';
import { useForm } from '@/core/hooks';
import { CommonService, JobService } from '@/core/services';
import { JobMilestone, ModalBaseProps, TaskTemplate } from '@/core/types';
import { CommonHelper } from '@/utils/helpers';

type TaskModalProps = ModalBaseProps<JobMilestone>;

const schema = yup.object({
  name: yup.string().required(),
  task_template_id: yup.string(),
  location_type: yup.mixed<LocationTypeEnum>().oneOf(Object.values(LocationTypeEnum)),
  number_of_men: yup.number().required(),
  total_working_hour: yup.number().required()
});

type TaskForm = yup.InferType<typeof schema>;

const TaskModal: React.FC<TaskModalProps> = ({ open, onCancel, fetchData, data }) => {
  const { t } = useTranslation(['message']);

  const { id } = useParams();
  const [formMilestone] = Form.useForm();
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    formField: { form, ...formProps }
  } = useForm<TaskForm>({
    schema,
    async onSubmit(values) {
      if (!values || !id || !data) return;
      setSubmitting(true);
      try {
        const res = await JobService.addTask(id, data.id, {
          name: values.name,
          task_template_id: values?.task_template_id
        });
        if (res.success) {
          toast.success(t(['success']));
          fetchData?.();
          onCancel();
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    open && onSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const task_template_id = Form.useWatch('task_template_id', form);

  const fetchTaskTemplates = useCallback(async (value: string) => {
    setLoading(true);
    try {
      const res = await CommonService.getTaskTemplates(value);
      if (res.success) {
        setTaskTemplates(res.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = (value: string) => {
    CommonHelper.debounceFn(value, fetchTaskTemplates);
  };

  useEffect(() => {
    if (open && data) {
      formMilestone.setFieldsValue({
        end_date: dayjs(data.end_date),
        name: data.name
      });
    }
  }, [open, data, formMilestone]);

  useEffect(() => {
    if (task_template_id) {
      const _taskTemplate = taskTemplates.find((item) => item.id === task_template_id);
      if (!_taskTemplate) return;
      form.setFieldsValue({
        location_type: _taskTemplate.location_type as LocationTypeEnum,
        number_of_men: _taskTemplate.number_of_men,
        total_working_hour: _taskTemplate.total_working_hour
      });
    } else {
      form.resetFields(['location_type', 'number_of_men', 'total_working_hour']);
    }
  }, [form, taskTemplates, task_template_id]);

  const onOk = () => {
    form.submit();
  };
  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      title="Add Task"
      width={700}
      confirmLoading={submitting}
      afterClose={() => {
        form.resetFields();
        formMilestone.resetFields();
      }}
      onOk={onOk}
    >
      <Form form={formMilestone} colon={false} layout="vertical">
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Form.Item label="Milestone" name={'name'}>
              <Input disabled placeholder="Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="End Date" name={'end_date'}>
              <AppDatePicker disabled className="w-full" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Divider className="!my-1" />
      <h2>Job Task</h2>
      <Form form={form} {...formProps} layout="vertical">
        <Form.Item label="Name" name="name" required>
          <Input placeholder="Task name" />
        </Form.Item>
        <Row gutter={[24, 0]}>
          <Col span={12}>
            <Form.Item label="Task Template" name="task_template_id">
              <AppSelect
                loading={loading}
                showSearch
                filterOption={false}
                placeholder="Task Template"
                onSearch={onSearch}
              >
                {taskTemplates?.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </AppSelect>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Location Type" name="location_type">
              <AppSelect placeholder="Location Type" disabled options={LocationTypes} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Numbers of Man" required name="number_of_men">
              <Input placeholder="Numbers of Man" disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Man Hours" required name="total_working_hour">
              <AppSelect placeholder="Man Hours" disabled options={Priorities} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </AppModal>
  );
};

export default TaskModal;
