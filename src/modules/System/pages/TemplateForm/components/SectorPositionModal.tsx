import { Form, Modal, Select } from 'antd';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { required } from '@/app/formRules';
import { RootState } from '@/app/store';
import { AppSelect } from '@/core/components';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { FormLayoutItem, ModalBaseProps, SectorPositionForm } from '@/core/types';
import {
  addSubTaskGroup,
  addSubTaskTemplate,
  fetchPositions,
  fetchSectors,
  updateSubTaskGroup
} from '../template-form.slice';

interface SectorPositionModalProps extends ModalBaseProps<any> {}

export const SectorPositionModal: React.FC<SectorPositionModalProps> = ({ open, onCancel }) => {
  const { t } = useTranslation(['message']);

  const [form] = Form.useForm<SectorPositionForm>();
  const [formLayoutItem] = useState<FormLayoutItem>({ labelCol: { span: 6 }, wrapperCol: { span: 18 } });

  const dispatch = useAppDispatch();
  const {
    positions,
    sectors,
    subTaskGroupIdActive,
    template: { subTasksGroup }
  } = useAppSelector((state: RootState) => state.templateForm);

  useEffect(() => {
    dispatch(fetchSectors());
    dispatch(fetchPositions());
  }, [dispatch]);

  const title = useMemo(() => {
    return `${subTaskGroupIdActive ? 'Edit' : 'Add'} Sector Position`;
  }, [subTaskGroupIdActive]);

  useEffect(() => {
    if (subTaskGroupIdActive && open) {
      const subTaskGroup = subTasksGroup.find((item) => item.id === subTaskGroupIdActive);
      if (!subTaskGroup) return;
      form.setFieldsValue({ sector_id: subTaskGroup.sector_id, position_id: subTaskGroup.position_id });
    }
  }, [subTaskGroupIdActive, subTasksGroup, form, open]);

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
      if (subTaskGroupIdActive && subTaskGroupIdActive === key) {
        resolve(true);
      } else {
        subTasksGroup.forEach((item) => {
          if (item.id === key) {
            reject(t('already exits'));
          }
        });
        resolve(true);
      }
    });

  const onOk = () => {
    form.validateFields().then(async (values) => {
      try {
        await checkExitsSectorPosition();
        const title = getKey(values);
        if (subTaskGroupIdActive) {
          dispatch(updateSubTaskGroup({ id: title, ...values }));
        } else {
          dispatch(addSubTaskTemplate({ parent_id: title, ...values }));
          dispatch(
            addSubTaskGroup({
              id: title,
              name: title,
              isSubTask: false,
              order_value: 1,
              ...values
            })
          );
        }
        onCancel();
      } catch (error: any) {
        toast.error(error);
      }
    });
  };

  return (
    <Modal
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
