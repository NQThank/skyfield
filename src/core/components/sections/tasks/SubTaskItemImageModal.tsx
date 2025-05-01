import { Form, Input, Modal, ModalProps } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { useForm } from '@/core/hooks';
import { JobTaskService } from '@/core/services';
import { useJobTask } from '@/store';
import { CommonHelper } from '@/utils/helpers';
import { pathNameTaskTemplate } from '@/core/constants';

type SubTaskItemImageModalProps = ModalProps & {
  subTaskId?: string;
  onCancel?: () => void;
};

const schema = yup.object({
  name: yup.string().required()
});
const SubTaskItemImageModal: React.FC<SubTaskItemImageModalProps> = ({ subTaskId, ...props }) => {
  const { updateTemplateItemsSubTask, templateItemActive, updateTemplateItem } = useJobTask();
  const { jobId, milestoneId, id } = useParams();
  const { pathname } = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const {
    formField: { form, ...formProps }
  } = useForm({
    schema,
    async onSubmit(data, error) {
      if (error || !data || !subTaskId) return;
      if (pathname.includes(pathNameTaskTemplate)) {
        if (isEdit && templateItemActive) {
          updateTemplateItem({ ...templateItemActive, ...data }, subTaskId);
        } else {
          updateTemplateItemsSubTask(
            [
              {
                id: CommonHelper.generateStr(),
                name: data?.name
              }
            ],
            subTaskId,
            false
          );
        }
        form.resetFields();
        props?.onCancel?.();
        setSubmitting(false);
      } else {
        if (!jobId || !milestoneId || !id) return;
        setSubmitting(true);
        try {
          if (isEdit && templateItemActive) {
            await JobTaskService.updateSubTaskItemImage(
              jobId,
              milestoneId,
              id,
              subTaskId,
              templateItemActive?.id,
              data
            );
            updateTemplateItem({ ...templateItemActive, ...data }, subTaskId);
          } else {
            const result = await JobTaskService.addSubTaskItemImage(jobId, milestoneId, id, subTaskId, data);
            updateTemplateItemsSubTask(
              [
                {
                  id: result.id,
                  name: data.name
                }
              ],
              subTaskId,
              false
            );
          }
        } finally {
          form.resetFields();
          props?.onCancel?.();
          setSubmitting(false);
        }
      }
    }
  });
  useEffect(() => {
    if (props.open && templateItemActive) {
      form.setFieldsValue({
        name: templateItemActive.name
      });
    }
  }, [form, props.open, templateItemActive]);

  const handleAfterClose = () => {
    form.resetFields();
  };

  const isEdit = useMemo(() => !!templateItemActive, [templateItemActive]);
  return (
    <Modal
      {...props}
      confirmLoading={submitting}
      title={isEdit ? 'Edit Item' : 'Add Item'}
      onOk={() => form.submit()}
      afterClose={handleAfterClose}
    >
      <Form form={form} {...formProps}>
        <Form.Item label="Name" name={'name'} required>
          <Input placeholder="Name" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubTaskItemImageModal;
