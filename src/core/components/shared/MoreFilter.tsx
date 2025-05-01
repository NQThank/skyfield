import { Popover, PopoverProps } from 'antd';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import AppButton from '../base/AppButton';

type MoreFilterProps = PopoverProps & {
  onSearch?: () => void;
  onReset?: () => void;
};

const MoreFilter: React.FC<MoreFilterProps> = ({ onSearch, onReset, ...props }) => {
  const { t } = useTranslation(['button']);

  return (
    <div className="relative">
      <Popover
        id="popover-filter"
        // open={open}
        getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
        placement="left"
        trigger="click"
        title={<h2>Filter</h2>}
        {...props}
        content={
          <div className="flex min-w-[400px] flex-col gap-y-3">
            {props.content as ReactNode}
            <div className="flex items-center justify-between">
              <AppButton
                className="min-w-[120px] border-violet-600 text-violet-600 hover:!border-violet-600 hover:!text-violet-600"
                onClick={onReset}
              >
                {t(['reset'])}
              </AppButton>
              <AppButton
                className="min-w-[120px]"
                type="primary"
                icon={<i className="fa-sharp fa-regular fa-magnifying-glass" />}
                onClick={onSearch}
              >
                {t(['search'])}
              </AppButton>
            </div>
          </div>
        }
      >
        <AppButton
          className="hover:!border-violet-600 hover:!text-violet-600"
          icon={<i className="fa-solid fa-filter" />}
        >
          {t(['more_filter'])}
        </AppButton>
      </Popover>
    </div>
  );
};

export default MoreFilter;
