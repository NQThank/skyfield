import { isEmpty } from 'lodash';
import { ItemType } from 'rc-collapse/es/interface';
import React, { MouseEvent, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AppButton, AppCollapse } from '@/core/components';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { CommonHelper } from '@/utils/helpers';
import {
  addSubTaskGroup,
  addSubTaskTemplate,
  setActiveKeySubTaskList,
  setActiveKeySubTaskListParent,
  subTasksTemplateGroupSelector,
  toggleOpenModal
} from '../template-form.slice';
import SubTaskEditable from './SubTaskEditable';

interface SectorPositionListProps {}

const SectorPositionList: React.FC<SectorPositionListProps> = () => {
  const { t } = useTranslation(['button']);

  const dispatch = useAppDispatch();
  const subTasksTemplateGroup = useAppSelector(subTasksTemplateGroupSelector);
  console.log('🚀 ~ subTasksTemplateGroup:', subTasksTemplateGroup);

  const {
    template: { activeKeySectorPosition, activeKeySubTaskListParent, sector_required, subTasksGroup }
  } = useAppSelector((state) => state.templateForm);
  console.log('🚀 ~ subTasksGroup:', subTasksGroup);

  const onAddSectorPosition = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (sector_required) {
      dispatch(toggleOpenModal('sector-position'));
    } else {
      dispatch(
        addSubTaskGroup({
          id: CommonHelper.generateStr(),
          isSubTask: true,
          order_value: 1,
          position_id: '',
          sector_id: '',
          name: 'Sub Task'
        })
      );
    }
  };

  const onAddSubTask = useCallback(
    (event: MouseEvent<HTMLElement>, parentId: string) => {
      event.stopPropagation();
      dispatch(addSubTaskTemplate({ parent_id: parentId, position_id: '', sector_id: '' }));
    },
    [dispatch]
  );

  const onChangeSubTaskList = (activeKey: string | string[]) => {
    dispatch(setActiveKeySubTaskList(activeKey));
  };
  const onChangeSubTask = (activeKey: string | string[]) => {
    dispatch(setActiveKeySubTaskListParent(activeKey));
  };

  const items = useMemo<ItemType[]>(() => {
    return subTasksGroup.map(({ id, isSubTask, name, uid }) => ({
      key: id,
      label: isSubTask ? <SubTaskEditable name={name} id={id} isGroup={true} uid={uid} /> : name,
      disabled: isSubTask,
      showArrow: !isSubTask,
      extra: !isSubTask && (
        <AppButton
          type="primary"
          ghost
          icon={<i className="fa-sharp fa-solid fa-plus" />}
          onClick={(e) => onAddSubTask(e, id)}
        >
          {t('new sub task')}
        </AppButton>
      ),
      children:
        !isSubTask &&
        subTasksTemplateGroup[id]?.map((subTask) => (
          <SubTaskEditable key={subTask.uid} name={subTask.name} uid={subTask.uid} id={subTask.id} isGroup={false} />
        ))
    }));
  }, [onAddSubTask, subTasksGroup, t, subTasksTemplateGroup]);

  return (
    <>
      <AppCollapse
        activeKey={activeKeySubTaskListParent}
        onChange={onChangeSubTask}
        items={[
          {
            key: 'sub-task',
            label: 'Sub Task',
            children: (
              <div>
                {!isEmpty(subTasksGroup) && (
                  <AppCollapse activeKey={activeKeySectorPosition} onChange={onChangeSubTaskList} items={items} />
                )}
              </div>
            ),
            extra: (
              <AppButton
                type="primary"
                ghost
                icon={<i className="fa-sharp fa-solid fa-plus" />}
                onClick={onAddSectorPosition}
              >
                {sector_required ? t('new sector position') : t('new sub task')}
              </AppButton>
            )
          }
        ]}
      />
    </>
  );
};

export default memo(SectorPositionList);
