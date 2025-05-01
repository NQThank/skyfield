import { Card, FormInstance, Input, InputRef } from 'antd';
import React, { Ref, memo, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as yup from 'yup';

import { useForm } from '@/core/hooks';
import { JobTaskService } from '@/core/services';
import { FormLayoutItem, TaskGeneralInfoType } from '@/core/types';
import { useJobTask } from '@/store';
import AppForm from '../../base/AppForm';
import AppFormItem from '../../base/AppFormItem';
import TaskStatus from './TaskStatus';
import { LocationTypeEnum } from '@/core/enums';
import { DataHelper } from '@/utils/helpers';

type TaskGeneralInfoProps = {
  ref: Ref<TaskGeneralInfoFormRef>;
};

const schema = yup.object({
  name: yup.string().required(),
  sector_required: yup.boolean()
});

export type TaskGeneralInfoFormRef = FormInstance<TaskGeneralInfoType>;

const TaskGeneralInfo: React.FC<TaskGeneralInfoProps> = React.forwardRef<TaskGeneralInfoFormRef, TaskGeneralInfoProps>(
  (_, ref) => {
    const { jobId, milestoneId, id } = useParams();
    const nameRef = useRef<InputRef>(null);
    const { loading, jobTaskInfo } = useJobTask();

    const {
      formField: { form, ...formProps }
    } = useForm({
      schema,
      onSubmit: async (data) => {
        if (!data) return;
        nameRef.current?.blur();
      }
    });

    const formLayoutItem = useMemo<FormLayoutItem>(() => ({ labelCol: { span: 8 }, wrapperCol: { span: 16 } }), []);

    useEffect(() => {
      if (jobTaskInfo && form) {
        form.setFieldsValue({ ...jobTaskInfo });
      }
    }, [jobTaskInfo, form]);

    const handleBlur = async (fieldName: string) => {
      await updateTaskName(fieldName, form.getFieldValue(fieldName as 'name' | 'sector_required'));
    };

    const updateTaskName = async (name: string, value: string | number) => {
      if (!jobId || !milestoneId || !id) return;
      await JobTaskService.updateTask(jobId, milestoneId, id, { [`${name}`]: value });
    };
    return (
      <Card title="General Information">
        <AppForm
          name="generalInfo"
          form={form}
          {...formLayoutItem}
          {...formProps}
          size="middle"
          ref={ref}
          disabled={loading}
        >
          <AppFormItem label="Task Name" name={'name'} required>
            <Input placeholder="Task Name" ref={nameRef} onBlur={() => handleBlur('name')} />
          </AppFormItem>
          <AppFormItem label="Task StatusName">
            <TaskStatus status={jobTaskInfo?.status} />
          </AppFormItem>
          <AppFormItem label="Progress">
            <div>{jobTaskInfo?.progress != null ? jobTaskInfo.progress.toFixed(2) : '0.00'}%</div>
          </AppFormItem>
          <AppFormItem label="Location Type">
            <div>
              {jobTaskInfo?.location_type && DataHelper.getEnumKeyByValue(jobTaskInfo?.location_type, LocationTypeEnum)}
            </div>
          </AppFormItem>
          <AppFormItem label="Numbers of Man" name="number_of_men">
            <Input
              type="number"
              placeholder="Numbers of Man"
              ref={nameRef}
              onBlur={() => handleBlur('number_of_men')}
            />
          </AppFormItem>
          <AppFormItem label="Man Hours" name="total_working_hour">
            <Input
              type="number"
              placeholder="Man Hours"
              ref={nameRef}
              onBlur={() => handleBlur('total_working_hour')}
            />
          </AppFormItem>
        </AppForm>
      </Card>
    );
  }
);

TaskGeneralInfo.displayName = 'TaskGeneralInfo';

export default memo(TaskGeneralInfo);
