import { Flex, Modal, ModalProps, Tooltip } from 'antd';
import clsx from 'clsx';
import React, { useState } from 'react';

import { FormItemMap } from '@/core/constants';
import { useJobTask } from '@/store';
import { CommonHelper, FormatHelper } from '@/utils/helpers';
import { FormItemType } from '@/core/types';
import { toast } from 'sonner';

type AddItemSubTaskModalProps = ModalProps & {
  subTaskId: string;
};

const AddItemSubTaskModal: React.FC<AddItemSubTaskModalProps> = ({ subTaskId, ...props }) => {
  const [activeItems, setActiveItems] = useState<FormItemType[]>([]);
  const { formItems, updateTemplateItemsSubTask } = useJobTask();

  const handleClickItem = (itemType: FormItemType) => {
    if (activeItems.includes(itemType)) {
      setActiveItems(activeItems.filter((item) => item !== itemType));
      return;
    }
    setActiveItems([...activeItems, itemType]);
  };

  const handleAddItems = () => {
    if (!activeItems.length) {
      toast.error('Please choose items');
      return;
    }
    updateTemplateItemsSubTask(
      activeItems.map((name) => ({
        id: CommonHelper.generateStr(),
        value: FormatHelper.tryParseJson(formItems.find((item) => item.name === name)?.master_value),
        name,
        order_value: 1,
        parent_id: subTaskId
      })),
      subTaskId,
      false
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    props.onCancel?.();
  };

  const handleAfterClose = () => {
    setActiveItems([]);
  };
  return (
    <Modal
      title="Choose Item"
      okText="Add Item"
      width={1000}
      onOk={handleAddItems}
      afterClose={handleAfterClose}
      okButtonProps={{ disabled: activeItems.length === 0 }}
      {...props}
    >
      <Flex wrap gap={12}>
        {formItems.map(({ id, name }) => (
          <div
            key={id}
            className={clsx(
              'flex h-24 w-24 cursor-pointer flex-col items-center justify-between gap-y-2 rounded-lg bg-gray-200 p-1 px-2 py-6 hover:bg-gray-100',
              { 'border border-solid border-primary': activeItems.includes(name) }
            )}
            onClick={() => handleClickItem(name)}
          >
            {FormItemMap[name]?.icon}
            <Tooltip title={FormItemMap[name]?.label ?? ''}>
              <span className="w-full truncate text-center text-base">{FormItemMap[name]?.label ?? ''}</span>
            </Tooltip>
          </div>
        ))}
      </Flex>
    </Modal>
  );
};

export default AddItemSubTaskModal;
