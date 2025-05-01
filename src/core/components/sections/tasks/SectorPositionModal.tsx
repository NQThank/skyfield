import { Form, Modal, ModalProps, Select } from 'antd';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { required } from '@/app/formRules';
import { AppSelect } from '@/core/components';
import { FormLayoutItem, JobSubTaskTemplate, SectorPositionForm } from '@/core/types';
import { useJobTask } from '@/store';
import { CommonHelper } from '@/utils/helpers';

type SectorPositionModalProps = ModalProps & {
  data?: JobSubTaskTemplate;
  onCancel: () => void;
};

export const SectorPositionModal: React.FC<SectorPositionModalProps> = ({ open, onCancel, data, ...props }) => {
  const { t } = useTranslation(['message']);
  const { sectors, positions, addSectorPosition, jobSubTasks, updateSectorPosition } = useJobTask();

  const [form] = Form.useForm<SectorPositionForm>();
  const [formLayoutItem] = useState<FormLayoutItem>({ labelCol: { span: 6 }, wrapperCol: { span: 18 } });

  const title = useMemo(() => {
    return `${data ? 'Edit' : 'Add'} Sector Position`;
  }, [data]);

  useEffect(() => {
    if (!data || !open) return;
    form.setFieldsValue({ sector_id: data.sector_id, position_id: data.position_id });
  }, [data, form, open]);

  const getKey = (values: SectorPositionForm) => {
    const sector = sectors.find((item) => item.id === values.sector_id);
    const position = positions.find((item) => item.id === values.position_id);
    let title = '';
    if (sector) {
      title += sector.name;
    }
    if (position) {
      title = title === '' ? position.name : `${title}-${position.name}`;
    }
    return title;
  };

  const checkExitsSectorPosition = () =>
    new Promise((resolve, reject) => {
      const values = form.getFieldsValue();
      const key = getKey(values);
      if (jobSubTasks.some((item) => item.id === key)) {
        reject(t('already exits'));
      }
      resolve(true);
    });

  const onOk = () => {
    form.validateFields().then(async (values: SectorPositionForm) => {
      try {
        await checkExitsSectorPosition();
      } catch (error: any) {
        toast.error(error);
        return;
      }
      const title = getKey(values);
      if (!data) {
        addSectorPosition({
          id: title,
          name: title,
          ...values,
          order_value: 1,
          children: [
            {
              id: CommonHelper.generateStr(),
              name: 'Sub Task',
              order_value: 1,
              parent_id: title,
              drag_status: true,
              status: 'init'
            }
          ],
          drag_status: true,
          status: 'done'
        });
      } else {
        updateSectorPosition(data.id, { id: title, name: title, ...values });
      }
      onCancel();
    });
  };

  return (
    <Modal
      {...props}
      open={open}
      onCancel={onCancel}
      title={title}
      onOk={onOk}
      maskClosable={false}
      afterClose={() => form.resetFields()}
    >
      <Form form={form} {...formLayoutItem} labelAlign="left" colon={false}>
        <Form.Item label="Sector" rules={[required]} name={'sector_id'}>
          <AppSelect placeholder="Sector">
            {sectors.map((sector) => (
              <Select.Option key={sector.id} value={sector.id}>
                {sector.name}
              </Select.Option>
            ))}
          </AppSelect>
        </Form.Item>
        <Form.Item label="Position" name={'position_id'}>
          <AppSelect placeholder="Position">
            {positions.map((position) => (
              <Select.Option key={position.id} value={position.id}>
                {position.name}
              </Select.Option>
            ))}
          </AppSelect>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default memo(SectorPositionModal);
