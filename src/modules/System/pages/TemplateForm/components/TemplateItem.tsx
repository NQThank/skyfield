import { Checkbox, Col, DatePicker, Divider, Input, Radio, Row, Select, Tooltip, Upload } from 'antd';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/core/components';
import { useAppDispatch } from '@/core/hooks';
import { ITemplateItem } from '@/core/types';
import { deleteTemplateItem, setItemTemplateEdit, toggleOpenModal } from '../template-form.slice';

interface TemplateItemProps {
  item: ITemplateItem;
  children: React.ReactNode;
  overlay?: boolean;
  subTaskId: string;
  isPreview?: boolean;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ item, children, overlay, subTaskId, isPreview = false }) => {
  const { t } = useTranslation(['message']);
  const dispatch = useAppDispatch();

  const component = useMemo(() => {
    switch (item.name) {
      case 'text':
        return <Input />;
      case 'date':
        return <DatePicker />;
      case 'option':
        return <Select options={item?.value?.value ?? []} className="w-full" />;
      case 'check_list':
        return <Checkbox.Group options={item?.value?.value ?? []} />;
      case 'radio':
        return <Radio.Group options={[]} />;
      case 'text_area':
        return <Input.TextArea />;
      case 'checkin':
        return <AppButton>Check in</AppButton>;
      case 'pre_post_photo':
        return (
          <div>
            <PhotoComponent quantity={1} />
            <Divider className="!mb-2 !mt-0" />
            <PhotoComponent quantity={1} />
          </div>
        );
      case 'punch_list_inspection_collection':
      case 'inspection_photos_collection':
      case 'photo_collection':
      case 'photo':
        return <PhotoComponent item={item} />;
    }
  }, [item]);

  const onEditItemTemplate = () => {
    dispatch(toggleOpenModal('template-item-form-edit'));
    dispatch(setItemTemplateEdit(item));
  };

  return (
    <div
      className={clsx(
        'group/item relative flex items-center gap-x-2 rounded-lg border border-dashed border-transparent p-2 transition-all',
        { 'hover:border-primary': !isPreview }
      )}
    >
      {children}
      <div className="scrollbar flex flex-1 flex-col overflow-x-auto overflow-y-hidden">
        <label className="text-gray-500">{item?.value?.label || ''}</label>
        <div>{component}</div>
      </div>
      <div
        className={clsx(
          'invisible absolute -top-4 right-1 flex gap-x-1 rounded-md bg-slate-50 px-2 py-1 shadow-xl transition-all',
          {
            'group-hover/item:visible': !overlay
          },
          { hidden: isPreview }
        )}
      >
        <Tooltip title={t('edit')}>
          <AppButton
            shape="circle"
            type="text"
            size="small"
            icon={<i className="fa-solid fa-pen-to-square fa-sm cursor-pointer" />}
            onClick={onEditItemTemplate}
          />
        </Tooltip>
        <Tooltip title={t('delete')}>
          <AppButton
            shape="circle"
            type="text"
            size="small"
            icon={<i className="fa-solid fa-trash-can fa-sm cursor-pointer text-red-500" />}
            onClick={() =>
              dispatch(deleteTemplateItem({ subTaskId, templateItemId: item.id, templateItemUid: item.uid }))
            }
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default TemplateItem;

const PhotoComponent: React.FC<{ item?: ITemplateItem; quantity?: number }> = ({ item, quantity = 1 }) => {
  return (
    <Row wrap={false}>
      {Array(item?.value?.quantity ?? quantity ?? 1)
        .fill(1)
        .map((_item, index) => {
          return (
            <Col key={index}>
              <Row>
                <Col span={24}>
                  <Upload listType="picture-card" disabled showUploadList={false}>
                    <div>
                      <i className="fa-light fa-image" style={{ fontSize: 30 }} />
                    </div>
                  </Upload>
                </Col>
              </Row>
            </Col>
          );
        })}
    </Row>
  );
};
