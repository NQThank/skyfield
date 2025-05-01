import { DatePicker, DatePickerProps } from 'antd';
import React from 'react';
import { Dayjs } from 'dayjs';

import { DateFormat } from '@/core/enums';

type AppDatePickerProps = DatePickerProps & {
  startDate?: Dayjs;
  endDate?: Dayjs;
};

const AppDatePicker: React.FC<AppDatePickerProps> = ({ startDate, endDate, ...props }) => {
  const disabledDate: any = (current: Dayjs) => {
    if (!current) return false;
    if (startDate && endDate) {
      return current.isBefore(startDate, 'day') || current.isAfter(endDate, 'day');
    }
    if (startDate) {
      return current.isBefore(startDate, 'day');
    }
    if (endDate) {
      return current.isAfter(endDate, 'day');
    }
    return false;
  };

  return (
    <div className="relative">
      <DatePicker
        getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
        suffixIcon={<i className="fa-solid fa-calendar-days text-gray-400" />}
        format={DateFormat['MM/DD/YYYY']}
        disabledDate={disabledDate}
        {...props}
      />
    </div>
  );
};

export default AppDatePicker;
