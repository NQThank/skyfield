import { Select, SelectProps, Spin } from 'antd';
import React from 'react';

interface AppSelectProps extends SelectProps {}

const AppSelect: React.FC<AppSelectProps> = ({ ...props }) => {
  return (
    <Select
      suffixIcon={<i className="fa-solid fa-caret-down fa-lg text-gray-400" />}
      getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
      dropdownRender={(originNode) =>
        props.loading ? (
          <div className="flex justify-center">
            <Spin />
          </div>
        ) : (
          originNode
        )
      }
      {...props}
    />
  );
};

export default AppSelect;
