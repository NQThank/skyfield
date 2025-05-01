import { Tooltip } from 'antd';
import React, { useMemo } from 'react';

import { FormItemMap } from '@/core/constants';
import { FormItem as TemplateFormItem } from '@/core/types';
import FormItemDraggable from './FormItemDraggable';

interface TemplateFormItemProps {
  item: TemplateFormItem;
}

const TemplateFormItem: React.FC<TemplateFormItemProps> = ({ item }) => {
  const formItem = useMemo(() => {
    return FormItemMap[item.name];
  }, [item]);

  return (
    <FormItemDraggable item={item}>
      <div className="flex h-24 w-24 flex-col items-center justify-between gap-y-2 rounded-lg bg-gray-200 px-2 py-6 hover:bg-gray-100">
        {formItem?.icon}
        <Tooltip title={formItem?.label || ''}>
          <span className="w-full truncate text-center text-base">{formItem?.label || ''}</span>
        </Tooltip>
      </div>
    </FormItemDraggable>
  );
};

export default TemplateFormItem;
