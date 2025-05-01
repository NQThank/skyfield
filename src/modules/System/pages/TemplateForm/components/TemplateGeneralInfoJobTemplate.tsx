import { Collapse, Form, FormInstance, Input } from 'antd';
import React, { Ref, forwardRef, memo, useState } from 'react';
import * as yup from 'yup';

import { AppSelect } from '@/core/components';
import { Priorities, TemplateTypes } from '@/core/constants';
import { PriorityEnum, TemplateTypeEnum } from '@/core/enums';
import { useForm } from '@/core/hooks';
import { FormLayoutItem, PayloadJobTemplate } from '@/core/types';
import TextArea from 'antd/es/input/TextArea';

interface TemplateGeneralInfoProps {
  ref: Ref<FormRef>;
  onSubmit: (data: PayloadJobTemplate) => Promise<void>;
}

const schemaLocal: yup.ObjectSchema<PayloadJobTemplate> = yup.object({
  name: yup.string().required(),
  scope_of_work: yup.string().nullable(),
  description: yup.string().nullable(),
  type: yup.mixed<TemplateTypeEnum>().oneOf(Object.values(TemplateTypeEnum)).nullable(),
  priority: yup.mixed<PriorityEnum>().oneOf(Object.values(PriorityEnum)).required(),
  add_document_ids: yup.array().of(yup.string()),
  delete_document_ids: yup.array().of(yup.string())
});

export type FormRef = FormInstance<PayloadJobTemplate>;

const TemplateGeneralInfoJobTemplate: React.FC<TemplateGeneralInfoProps> = forwardRef<
  FormRef,
  TemplateGeneralInfoProps
>(function TemplateGeneralInfo({ onSubmit }, ref) {
  const {
    formField: { form, onFinish, ...formProps }
  } = useForm<PayloadJobTemplate>({
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
  // const dispatch = useAppDispatch();

  const onValuesChange = () => {
    // dispatch(setGeneralInfo(form.getFieldsValue()));
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
              <Form.Item label="Job Template Name" name={'name'} required>
                <Input placeholder="Job Template Name" />
              </Form.Item>
              <Form.Item label="Priority" name={'priority'} required>
                <AppSelect placeholder="Priority" options={Priorities} />
              </Form.Item>
              <Form.Item label="Type" name={'type'}>
                <AppSelect placeholder="Type" options={TemplateTypes} />
              </Form.Item>
              <Form.Item label="Scope" name={'scope_of_work'}>
                <Input placeholder="Scope" />
              </Form.Item>
              <Form.Item label="Description" name={'description'}>
                <TextArea rows={4} />
              </Form.Item>
            </Form>
          ),
          showArrow: false
        }
      ]}
    />
  );
});

export default memo(TemplateGeneralInfoJobTemplate);
