import { Col, Divider, Form, Input, Row, Select } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as yup from 'yup';

import { AppModal, AppSelect } from '@/core/components';
import { LocationTypes, Priorities } from '@/core/constants';
import { LocationTypeEnum } from '@/core/enums';
import { useForm } from '@/core/hooks';
import { CommonService } from '@/core/services';
import { TaskTemplate } from '@/core/types';
import { CommonHelper } from '@/utils/helpers';
import { ListAddMilestone } from './CardMilestoneTemplate';

// type TaskModalProps = ModalBaseProps<JobMilestone>;
type TaskModalProps = {
  open: boolean;
  onCancel: () => void;
  data: any;
  list: ListAddMilestone;
  actionType: string;
  milestoneSelected: string;
};

const schema = yup.object({
  task_template_id: yup.string().required(),
  location_type: yup.mixed<LocationTypeEnum>().oneOf(Object.values(LocationTypeEnum)).required(),
  number_of_men: yup.number().required(),
  total_working_hour: yup.number().required()
});

type TaskForm = yup.InferType<typeof schema>;

const TaskModalTemplate: React.FC<TaskModalProps> = ({ open, onCancel, data, list, actionType, milestoneSelected }) => {
  const { t } = useTranslation(['message']);

  const [formMilestone] = Form.useForm();
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, _setSubmitting] = useState(false);

  const {
    formField: { form, ...formProps }
  } = useForm<TaskForm>({
    schema,
    async onSubmit(values) {
      if (!values) return;
      if (actionType === 'add') {
        const valueMap = {
          ...values,
          name: taskTemplates.find((e) => e.id === values?.task_template_id)?.name,
          id: CommonHelper.generateStr()
        };
        const newTask: any = list.milestone.find((i: any) => i.id === data.id);
        newTask.job_tasks = newTask?.job_tasks ? [...newTask.job_tasks, valueMap] : [valueMap];
        const newMilestone = list.milestone.map((e: any) => {
          if (e.id === data.id) return newTask;
          else return e;
        });
        list.setMilestone(newMilestone);
      } else {
        if (!data) return;
        list.setMilestone(
          list.milestone.map((e: any) => {
            if (e.id !== milestoneSelected) return e;
            else {
              return {
                ...e,
                job_tasks: e.job_tasks.map((i: any) => {
                  if (i.id !== data.id) return i;
                  else {
                    return {
                      ...i,
                      ...values,
                      name: taskTemplates.find((j) => j.id === values?.task_template_id)?.name
                    };
                  }
                })
              };
            }
          })
        );
      }
      toast.success(t(['success']));
      onCancel();
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

  useEffect(() => {
    if (actionType === 'edit') {
      form.setFieldsValue({
        location_type: data.location_type,
        task_template_id: data.task_template_id,
        number_of_men: data.number_of_men,
        total_working_hour: data.total_working_hour
      });
    }
  }, [actionType, data, form, open]);

  const onOk = () => {
    form.submit();
  };
  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      title={`${actionType === 'add' ? 'Add' : 'Edit'} Task`}
      width={900}
      confirmLoading={submitting}
      afterClose={() => {
        form.resetFields();
        formMilestone.resetFields();
      }}
      onOk={onOk}
    >
      <Form form={formMilestone} colon={false} layout="vertical">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Form.Item label="Milestone" name={'name'}>
              <Input disabled placeholder="Name" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Divider className="!my-1" />
      <h2>Job Task</h2>
      <Form form={form} {...formProps} layout="vertical">
        <Row gutter={[24, 0]}>
          <Col span={12}>
            <Form.Item label="Task Template" name="task_template_id" required>
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
            <Form.Item label="Location Type" required name="location_type">
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

export default TaskModalTemplate;
