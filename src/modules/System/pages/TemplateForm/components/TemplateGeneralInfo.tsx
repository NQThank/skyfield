import { Collapse, Form, FormInstance, Input } from 'antd';
import React, { Ref, forwardRef, memo, useState } from 'react';
import * as yup from 'yup';

import { AppSelect } from '@/core/components';
import { LocationTypes } from '@/core/constants';
import { LocationTypeEnum } from '@/core/enums';
import { useAppDispatch, useForm } from '@/core/hooks';
import { FormLayoutItem, GeneralInfoForm, PayloadJobTemplate } from '@/core/types';
import { setGeneralInfo } from '../template-form.slice';

interface TemplateGeneralInfoProps {
  ref: Ref<FormRef>;
  onSubmit: (data: GeneralInfoForm) => Promise<void>;
}

const schemaLocal: yup.ObjectSchema<GeneralInfoForm> = yup.object({
  name: yup.string().required(),
  location_type: yup.mixed<LocationTypeEnum>().oneOf(Object.values(LocationTypeEnum)).required(),
  number_of_men: yup.number().required(),
  total_working_hour: yup.number().required()
});

export type FormRef = FormInstance<GeneralInfoForm>;
export type FormRefJobTemplate = FormInstance<PayloadJobTemplate>;

const TemplateGeneralInfo: React.FC<TemplateGeneralInfoProps> = forwardRef<FormRef, TemplateGeneralInfoProps>(
  function TemplateGeneralInfo({ onSubmit }, ref) {
    const {
      formField: { form, onFinish, ...formProps }
    } = useForm<GeneralInfoForm>({
      schema: schemaLocal,
      onSubmit: (data) => {
        if (!data) return;
        onSubmit(data);
      }
    });
    const [formLayoutItem] = useState<FormLayoutItem>({
      labelCol: { span: 9 },
      wrapperCol: { span: 15 }
    });
    const dispatch = useAppDispatch();

    const onValuesChange = () => {
      dispatch(setGeneralInfo(form.getFieldsValue()));
    };

    return (
      <Collapse
        activeKey={['general']}
        items={[
          {
            key: 'general',
            label: 'General',
            children: (
              <Form
                onValuesChange={onValuesChange}
                {...formProps}
                {...formLayoutItem}
                labelWrap
                name="general-info-form"
                form={form}
                onFinish={onFinish}
                labelAlign="left"
                colon={false}
                initialValues={{ sector_required: true }}
                ref={ref}
              >
                <Form.Item label="Task Name" name={'name'} required>
                  <Input placeholder="Task Name" />
                </Form.Item>
                <Form.Item label="Location Type" name={'location_type'} required>
                  <AppSelect placeholder="Location Type" options={LocationTypes} allowClear />
                </Form.Item>
                <Form.Item label="Numbers of Man" name="number_of_men" required>
                  <Input type="number" placeholder="Numbers of Man" />
                </Form.Item>
                <Form.Item label="Man Hours" name={'total_working_hour'} required>
                  <Input type="number" placeholder="Man Hours" />
                </Form.Item>
              </Form>
            ),
            showArrow: false
          }
        ]}
      />
    );
  }
);

export default memo(TemplateGeneralInfo);
