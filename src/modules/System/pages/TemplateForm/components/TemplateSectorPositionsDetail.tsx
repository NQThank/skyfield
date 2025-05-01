import { Divider, Tooltip } from 'antd';
import { isEmpty } from 'lodash';
import { ItemType } from 'rc-collapse/es/interface';
import React, { MouseEvent, memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton, AppCollapse } from '@/core/components';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { TemplateSubTask } from '@/core/types';
import {
  deleteSubtaskGroup,
  setSubTaskActive,
  setSubTaskGroupEdit,
  subTasksTemplateGroupSelector,
  toggleOpenModal
} from '../template-form.slice';
import EquipmentSubTaskModal from './EquipmentSubTaskModal';
import SubTaskDetail from './SubTaskDetail';

type TemplateSectorPositionsDetailProps = {
  isPreview?: boolean;
};

const TemplateSectorPositionsDetail: React.FC<TemplateSectorPositionsDetailProps> = ({ isPreview = false }) => {
  const { t } = useTranslation(['button']);

  const dispatch = useAppDispatch();
  const {
    template: { itemTemplates, name, subTasksGroup }
  } = useAppSelector((state) => state.templateForm);
  const subTasksTemplateGroup = useAppSelector(subTasksTemplateGroupSelector);

  const [isOpen, setIsOpen] = useState(false);

  const onAddEquipment = useCallback(
    (e: MouseEvent<HTMLElement>, subTask: TemplateSubTask) => {
      e.stopPropagation();
      setIsOpen(true);
      dispatch(setSubTaskActive(subTask));
    },
    [dispatch]
  );

  const onDeleteSubTaskGroup = useCallback(
    (e: MouseEvent<HTMLElement>, id: string) => {
      e.stopPropagation();
      dispatch(deleteSubtaskGroup(id));
    },
    [dispatch]
  );

  const onEditSubTaskGroup = useCallback(
    (e: MouseEvent<HTMLElement>, id: string) => {
      e.stopPropagation();
      dispatch(toggleOpenModal('sector-position'));
      dispatch(setSubTaskGroupEdit(id));
    },
    [dispatch]
  );

  const items = useMemo<ItemType[]>(() => {
    return subTasksGroup.map(({ id, isSubTask, name }) => ({
      key: id,
      label: name,
      extra:
        !isPreview &&
        (isSubTask ? (
          <AppButton type="primary" ghost onClick={(e) => onAddEquipment(e, { id, title: name })}>
            {t('update_equipment')}
          </AppButton>
        ) : (
          <div>
            <Tooltip title="Delete">
              <AppButton iconType="delete" type="text" shape="circle" onClick={(e) => onDeleteSubTaskGroup(e, id)} />
            </Tooltip>
            <Tooltip title="Edit">
              <AppButton iconType="edit" type="text" shape="circle" onClick={(e) => onEditSubTaskGroup(e, id)} />
            </Tooltip>
          </div>
        )),
      children: isSubTask ? (
        <SubTaskDetail items={itemTemplates[id] || []} id={id} isPreview={isPreview} />
      ) : (
        <AppCollapse
          items={subTasksTemplateGroup[id]?.map(({ id, name }) => ({
            key: id,
            label: name,
            extra: !isPreview && (
              <AppButton type="primary" ghost onClick={(e) => onAddEquipment(e, { id, title: name })}>
                {t('update_equipment')}
              </AppButton>
            ),
            children: <SubTaskDetail items={itemTemplates[id] || []} id={id} isPreview={isPreview} />
          }))}
        />
      )
    }));
  }, [
    subTasksGroup,
    t,
    subTasksTemplateGroup,
    isPreview,
    onAddEquipment,
    itemTemplates,
    onDeleteSubTaskGroup,
    onEditSubTaskGroup
  ]);

  return (
    <>
      <div>
        {!isPreview && <Divider>{name}</Divider>}
        {!isEmpty(subTasksGroup) && <AppCollapse items={items} />}
      </div>
      <EquipmentSubTaskModal open={isOpen} onCancel={() => setIsOpen(false)} />
    </>
  );
};

export default memo(TemplateSectorPositionsDetail);
