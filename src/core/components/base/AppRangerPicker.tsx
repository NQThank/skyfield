import { DatePicker, TimeRangePickerProps } from 'antd';
import React from 'react';

import { DateFormat } from '@/core/enums';
type AppRangerPickerProps = Omit<TimeRangePickerProps, 'locale' | 'generateConfig' | 'hideHeader'>;
const { RangePicker } = DatePicker;
const AppRangerPicker: React.FC<AppRangerPickerProps> = ({ ...props }) => {
  return (
    <div className="relative">
      <RangePicker
        getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
        suffixIcon={<i className="fa-solid fa-calendar-days text-gray-400" />}
        format={DateFormat['MM/DD/YYYY']}
        {...props}
      />
    </div>
  );
};

export default AppRangerPicker;
