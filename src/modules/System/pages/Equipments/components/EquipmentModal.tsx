import { Col, Form, Input, InputNumber, Row } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as yup from 'yup';

import { AppModal, AppSelect } from '@/core/components';
import { useForm } from '@/core/hooks';
import { EquipmentService } from '@/core/services';
import { Equipment, EquipmentType, ModalBaseProps, ResponseCommon } from '@/core/types';
import { EquipmentTypes } from '@/core/constants';

type IEquipmentModalProps = ModalBaseProps<Equipment>;

const schema = yup.object({
  name: yup.string().required(),
  type: yup.mixed<EquipmentType>().required(),
  manufacturer: yup.string().nullable(),
  model: yup.string().nullable(),
  part_number: yup.string().nullable(),
  weight: yup.number().nullable(),
  height: yup.number().nullable(),
  width: yup.number().nullable(),
  depth: yup.number().nullable(),
  details: yup.string().nullable(),
  uom: yup.string().nullable(),
  category: yup.string().nullable(),
  price: yup.number().nullable(),
  sku: yup.string().nullable()
});

type EquipmentForm = yup.InferType<typeof schema>;

const EquipmentModal: React.FC<IEquipmentModalProps> = ({ open, onCancel, actionType, data, fetchData }) => {
  const { t } = useTranslation(['message']);
  const [loading, setLoading] = useState(false);
  const {
    formField: { form, ...props }
  } = useForm<EquipmentForm>({
    schema,
    async onSubmit(values) {
      if (!values) return;
      setLoading(true);
      try {
        let res: ResponseCommon<null> | null = null;
        if (actionType === 'edit' && data) {
          res = await EquipmentService.updateEquipment(data.id, values);
        } else {
          res = await EquipmentService.addEquipment(values);
        }
        if (res?.success) {
          toast.success(t(['success']));
          onCancel();
          fetchData?.();
        }
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({ ...data });
    }
  }, [open, data, form]);

  const title = useMemo(() => `${actionType === 'edit' ? 'Edit' : 'Add'} Equipment`, [actionType]);

  const onOk = () => {
    form.submit();
  };

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      title={title}
      onOk={onOk}
      width={800}
      confirmLoading={loading}
      afterClose={() => form.resetFields()}
    >
      <Form form={form} {...props} colon={false} labelAlign="left" layout="vertical">
        <Row gutter={[24, 12]}>
          <Col span={12}>
            <Form.Item label="Name" name="name" required>
              <Input placeholder="Name" />
            </Form.Item>
            <Form.Item label="Type" name="type" required>
              <AppSelect placeholder="Type" options={EquipmentTypes} />
            </Form.Item>
            <Form.Item label="Manufacturer" name="manufacturer">
              <Input placeholder="Manufacturer" />
            </Form.Item>
            <Form.Item label="Model" name="model">
              <Input placeholder="Model" />
            </Form.Item>
            <Form.Item label="Part Number" name="part_number">
              <Input placeholder="Part Number" />
            </Form.Item>
            <Form.Item label="Weight" name="weight">
              <InputNumber placeholder="Weight" className="w-full" />
            </Form.Item>
            <Form.Item label="Height" name="height">
              <InputNumber placeholder="Height" className="w-full" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Width" name="width">
              <InputNumber placeholder="Width" className="w-full" />
            </Form.Item>
            <Form.Item label="Depth" name="depth">
              <InputNumber placeholder="Depth" className="w-full" />
            </Form.Item>
            <Form.Item label="Details" name="details">
              <Input placeholder="Details" />
            </Form.Item>
            <Form.Item label="Uom" name="uom">
              <Input placeholder="Uom" />
            </Form.Item>
            <Form.Item label="Category" name="category">
              <Input placeholder="Category" />
            </Form.Item>
            <Form.Item label="Price" name="price">
              <InputNumber placeholder="Price" className="w-full" />
            </Form.Item>
            <Form.Item label="Sku" name="sku">
              <Input placeholder="Sku" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </AppModal>
  );
};

export default EquipmentModal;
