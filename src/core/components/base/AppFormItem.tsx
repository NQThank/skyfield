import { Form, Tooltip } from 'antd';
import type { FormItemProps } from 'antd';
import React, { useMemo } from 'react';

type AppFormItemProps = FormItemProps & {
  hint?: React.ReactNode;
};

const AppFormItem: React.FC<AppFormItemProps> = ({ label, hint, ...props }) => {
  const labelFormItem = useMemo(() => {
    if (!label) return undefined;
    if (!hint) return label;
    return (
      <span>
        {label}{' '}
        <Tooltip title={hint}>
          <i className="fa-sharp fa-solid fa-circle-info" />
        </Tooltip>
      </span>
    );
  }, [label, hint]);
  return <Form.Item {...props} label={labelFormItem} />;
};

export default AppFormItem;
