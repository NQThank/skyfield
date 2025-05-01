import { Col, Form, Input, Row, Select, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { AppButton } from '@/core/components';
import { useForm } from '@/core/hooks';
import { CommonService, JobService } from '@/core/services';
import { Equipment, ResponseCommon } from '@/core/types';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

type Props = {
  onCancel: () => void;
  fetchData: () => void;
};

const schema = yup.object({
  id: yup.string(),
  quantity: yup.number()
});

type EquipmentForm = yup.InferType<typeof schema>;

const ModalEquipment = ({ onCancel, fetchData }: Props) => {
  const { t } = useTranslation(['message', 'button']);
  const { id } = useParams();

  const [loading, setLoading] = useState<boolean>(false);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const [submitting, _setSubmitting] = useState(false);

  const {
    formField: { form, ...formProps }
  } = useForm<EquipmentForm>({
    schema,
    async onSubmit(values) {
      if (!values) return;
      setLoading(true);
      try {
        if (!id) return;
        let res: ResponseCommon<null> | null = null;
        res = await JobService.updateEquipmentsJob(id, {
          job_equipments: [{ equipment_id: values.id || '', quantity: values.quantity || 0 }]
        });

        if (res?.success) {
          toast.success(t(['success']));
          onCancel();
          fetchData();
        }
      } finally {
        setLoading(false);
      }
    }
  });
  const fetchEquipmentOptions = async (value: string) => {
    try {
      setLoading(true);
      const res = await CommonService.getEquipments(value);
      if (res.success && res.data) setEquipment(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEquipmentOptions('');
  }, []);

  return (
    <div className="flex flex-col gap-y-2">
      <Spin spinning={loading}>
        <Form
          labelCol={{ span: 6 }}
          labelAlign="left"
          wrapperCol={{ span: 18 }}
          form={form}
          {...formProps}
          layout="horizontal"
          disabled={submitting}
        >
          <Row gutter={[24, 0]}>
            <Col md={24} sm={24} xs={24}>
              <Form.Item name="id" label="Equipment">
                <Select placeholder="Equipment" options={equipment} fieldNames={{ label: 'name', value: 'id' }} />
              </Form.Item>
              <Form.Item name="quantity" label="Quantity">
                <Input placeholder="Quantity" type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 6]} justify={'end'}>
            <Col>
              <AppButton type="primary" htmlType="submit" loading={loading}>
                {t(['button:add'])}
              </AppButton>
            </Col>
          </Row>
        </Form>
      </Spin>
    </div>
  );
};

export default ModalEquipment;
