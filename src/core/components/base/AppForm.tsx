import React from 'react';
import { Form } from 'antd';
import type { FormProps, FormInstance } from 'antd';

import { useScreen } from '@/core/hooks';

type AppFormProps = FormProps & {
  children?: React.ReactNode;
} & {
  ref?: React.Ref<FormInstance>;
};

const AppForm: React.FC<AppFormProps> = React.forwardRef(({ ...props }, ref) => {
  const { md } = useScreen();
  return <Form size={md ? 'large' : 'middle'} labelAlign="left" labelWrap colon={false} {...props} ref={ref} />;
});
AppForm.displayName = 'AppForm';
export default AppForm;
