import { Checkbox, Form, Input, InputRef, Modal, Popover, PopoverProps, Switch } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useKeyboard } from '@/core/hooks';
import AppButton from '../../base/AppButton';
import AppFormItem from '../../base/AppFormItem';
import { FormLayoutItem } from '@/core/types';
import { JobTaskService } from '@/core/services';
import { useParams } from 'react-router-dom';
import { useJobTask } from '@/store';

type WrapperTextSubTaskProps = {
  id: string;
  parentId?: string;
  data: { name?: string; approve_required?: boolean; item_required?: boolean; marked?: boolean };
  onSave: (data: { name?: string; approve_required?: boolean; item_required?: boolean; marked?: boolean }) => void;
  onDelete: (id: string, parentId?: string) => void;
};

const WrapperTextSubTask: React.FC<WrapperTextSubTaskProps> = ({ id, parentId, data, onSave, onDelete }) => {
  const { updateJobSubTaskName } = useJobTask();

  const [subTaskName, setSubTaskName] = useState(data.name);
  const [marked, setMarker] = useState(data?.marked || false);
  const [open, setOpen] = useState(false);
  const [disable, setDisable] = useState(false);
  const [itemRequired, setItemRequired] = useState(false);

  const inputRef = useRef<InputRef>(null);

  const [form] = Form.useForm();
  const { jobId, milestoneId, id: idTask } = useParams();

  useKeyboard({
    key: 'Escape',
    onKeyPressed: () => {
      console.log('esc');
      setOpen(false);
    }
  });

  const onSaveSubTaskName = (data: { name?: string; approve_required: boolean; item_required?: boolean }) => {
    onSave({ ...data, marked });
    setOpen(false);
  };

  const onOpenChange: PopoverProps['onOpenChange'] = (newOpen) => {
    setOpen(newOpen);
    if (newOpen) {
      setSubTaskName(data.name);
      setTimeout(() => {
        inputRef?.current?.focus({ cursor: 'end' });
      });
    }
  };

  const handleDeleteSubTask = () => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Are you sure you want to delete this subtask?',
      onOk() {
        onDelete(id, parentId);
      }
    });
  };
  useEffect(() => {
    form.setFieldsValue({
      name: data.name,
      approve_required: data.approve_required,
      item_required: data.item_required
    });
    setDisable(!!data.item_required);
  }, [subTaskName, form]);

  const formLayoutItem = useMemo<FormLayoutItem>(() => ({ labelCol: { span: 10 }, wrapperCol: { span: 14 } }), []);
  const handleChangeMark = async (marked: boolean) => {
    if (!jobId || !milestoneId || !idTask) return;
    await JobTaskService.updateSubTask(jobId, milestoneId, idTask, id, {
      marked
    });
  };
  const onValuesChange = (fields: object) => {
    if (Object.keys(fields)[0] === 'item_required') {
      setDisable(Object.values(fields)[0]);
      if (Object.values(fields)[0] === false) form.setFieldValue('approve_required', false);
    }
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Checkbox
          className="mr-2"
          checked={marked}
          onChange={(e) => {
            handleChangeMark(e.target.checked);
            setMarker(e.target.checked);
            updateJobSubTaskName(id, { marked: e.target.checked }, parentId);
          }}
        />
        {data.name}{' '}
        <Popover
          content={
            <div className="flex w-96 flex-col gap-x-2">
              <Form
                form={form}
                size="middle"
                onFinish={onSaveSubTaskName}
                {...formLayoutItem}
                initialValues={{ item_required: itemRequired }}
                labelAlign="left"
                onValuesChange={onValuesChange}
              >
                <AppFormItem label="Name" name={'name'}>
                  <Input placeholder="Name" />
                </AppFormItem>
                <AppFormItem label="Item Required" name={'item_required'}>
                  <Switch
                    checkedChildren="On"
                    unCheckedChildren="Off"
                    onChange={(checked) => setItemRequired(checked)}
                  />
                </AppFormItem>
                <AppFormItem className="" label="Approval Required" name={'approve_required'}>
                  <Switch disabled={!disable} checkedChildren="On" unCheckedChildren="Off" />
                </AppFormItem>
                <AppButton className="float-right" type="primary" htmlType="submit">
                  Save
                </AppButton>
              </Form>
            </div>
          }
          open={open}
          onOpenChange={onOpenChange}
          title="Update Sub Task"
          trigger="click"
          destroyTooltipOnHide
        >
          <AppButton icon={<i className="fa-solid fa-pen-to-square" />} size="small" type="text" title="Update" />
        </Popover>
      </div>
      <AppButton
        iconType="delete"
        size="small"
        type="text"
        shape="circle"
        title="Delete Subtask"
        onClick={handleDeleteSubTask}
      />
    </div>
  );
};

export default WrapperTextSubTask;
