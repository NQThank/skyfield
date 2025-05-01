import { Flex, Switch } from 'antd';
import { isEmpty } from 'lodash';
import { ItemType } from 'rc-collapse/es/interface';
import React, { memo, MouseEvent, useCallback, useMemo } from 'react';

import { JobSubTaskEquipment, JobSubTaskTemplate, OpenJobTaskType } from '@/core/types';
import { useJobTask } from '@/store';
import AppButton from '../../base/AppButton';
import AppCollapse from '../../base/AppCollapse';
import AddItemSubTaskModal from './AddItemSubTaskModal';
import SubTaskEquipmentModal from './SubTaskEquipmentModal';
import SubTaskItemDroppable from './SubTaskItemDroppable';
import SubTaskItemImageModal from './SubTaskItemImageModal';
import TemplateItemFormModal from './TemplateItemFormModal';
import { JobService, JobTaskService } from '@/core/services';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { pathNameTaskTemplate } from '@/core/constants';

type SubTaskDetailGroupProps = {
  preview?: boolean;
};
function compareEquipmentIds(originalList: string[], updatedList: string[]) {
  const addIds = updatedList.filter((id) => !originalList.includes(id));
  const updateIds = updatedList.filter((id) => originalList.includes(id));
  const deleteIds = originalList.filter((id) => !updatedList.includes(id));

  return {
    addIds,
    updateIds,
    deleteIds
  };
}
const SubTaskDetailGroup: React.FC<SubTaskDetailGroupProps> = ({ preview = false }) => {
  const { id, jobId, milestoneId } = useParams();
  const {
    templateItemActive,
    jobSubTasks,
    jobTemplateItemsSubTaskMap,
    updateEquipmentToSubTask,
    jobSubTaskEquipmentsMap,
    isOpenJobTask,
    setIsOpenJobTask,
    activeKeysSubTaskCollapse,
    activeKeysChildSubTaskCollapse,
    setActiveKeysSubTaskCollapse,
    setActiveKeysChildSubTaskCollapse,
    subTaskIdActive,
    setSubTaskIdActive,
    setTemplateItemActive
  } = useJobTask();

  const handleOpenUpdateEquipment = useCallback(
    (e: MouseEvent<HTMLElement>, subTaskId: string) => {
      e.stopPropagation();
      setIsOpenJobTask('equipment', true);
      setSubTaskIdActive(subTaskId);
    },
    [setIsOpenJobTask, setSubTaskIdActive]
  );

  const handleAddItem = useCallback(
    async (e: MouseEvent<HTMLElement>, subTaskId: string) => {
      e.stopPropagation();
      setIsOpenJobTask('add-item-image', true);
      setSubTaskIdActive(subTaskId);
    },
    [setIsOpenJobTask, setSubTaskIdActive]
  );

  const buildHeaderLeftSubTask = useCallback(
    (item: JobSubTaskTemplate) => {
      return (
        <div>
          <div>
            <b>{item.name}</b> <i>({jobTemplateItemsSubTaskMap[item.id]?.length || item?.item_count || 0} items)</i>
          </div>
          {/* <span>Total Man Hours : 20 hours</span> */}
        </div>
      );
    },
    [jobTemplateItemsSubTaskMap]
  );

  const items = useMemo<ItemType[]>(() => {
    const _items: ItemType[] = jobSubTasks.map((item) => {
      const { id, name, children } = item;
      return {
        key: id,
        label: !children ? buildHeaderLeftSubTask(item) : name,
        extra: !children ? (
          <SubTaskHeaderAction
            item={item}
            subTaskId={item.id}
            onUpdateEquipment={handleOpenUpdateEquipment}
            onAddItem={handleAddItem}
          />
        ) : null,
        children: children ? (
          !isEmpty(children) ? (
            <AppCollapse
              activeKey={activeKeysChildSubTaskCollapse}
              onChange={setActiveKeysChildSubTaskCollapse}
              items={(children ?? []).map((item) => ({
                id: item.id,
                key: item.id,
                label: buildHeaderLeftSubTask(item),
                extra: !preview ? (
                  <SubTaskHeaderAction
                    item={item}
                    subTaskId={item.id}
                    onUpdateEquipment={handleOpenUpdateEquipment}
                    onAddItem={handleAddItem}
                  />
                ) : null,
                children: (
                  <SubTaskItemDroppable
                    items={jobTemplateItemsSubTaskMap[item.id] ?? []}
                    id={item.id}
                    equipments={jobSubTaskEquipmentsMap[item.id] ?? []}
                    drag_status={item.drag_status}
                  />
                )
              }))}
            />
          ) : null
        ) : (
          <SubTaskItemDroppable
            items={jobTemplateItemsSubTaskMap[id] ?? []}
            id={id}
            equipments={jobSubTaskEquipmentsMap[id] ?? []}
            drag_status={item.drag_status}
          />
        )
      };
    });
    return _items;
  }, [
    jobSubTasks,
    handleOpenUpdateEquipment,
    jobTemplateItemsSubTaskMap,
    jobSubTaskEquipmentsMap,
    preview,
    handleAddItem,
    buildHeaderLeftSubTask,
    activeKeysChildSubTaskCollapse,
    setActiveKeysChildSubTaskCollapse
  ]);

  const handleUpdateEquipment = useCallback(
    async (data: JobSubTaskEquipment[], listId: string[]) => {
      if (!subTaskIdActive || !jobId || !milestoneId || !id) return;
      updateEquipmentToSubTask(subTaskIdActive, data);
      const obj = compareEquipmentIds(listId, data.map((i: any) => i.id) || []);
      const payload = {
        delete_job_sub_task_equipment_ids: obj.deleteIds,
        add_job_sub_task_equipment_ids: data.filter((i: any) => obj.addIds.includes(i.id)),
        update_job_sub_task_equipment_ids: data.filter((i: any) => obj.updateIds.includes(i.id))
      };
      const res = await JobService.updateEquipmentTask(jobId, milestoneId, id, subTaskIdActive, payload);
      if (res.success) {
        toast.success('Update equipment success');
      }
    },
    [subTaskIdActive, updateEquipmentToSubTask, jobId, milestoneId, id]
  );

  const onCancelUpdateEquipment = useCallback(() => {
    setIsOpenJobTask('equipment', false);
    setSubTaskIdActive(undefined);
  }, [setIsOpenJobTask, setSubTaskIdActive]);

  const handleCloseModal = useCallback(
    (type: OpenJobTaskType) => {
      setIsOpenJobTask(type, false);
    },
    [setIsOpenJobTask]
  );

  const handleCancelModalSubTaskItem = () => {
    setTemplateItemActive(undefined);
    handleCloseModal('add-item-image');
  };

  return (
    <>
      <div>
        {!isEmpty(items) ? (
          <AppCollapse items={items} activeKey={activeKeysSubTaskCollapse} onChange={setActiveKeysSubTaskCollapse} />
        ) : null}
      </div>
      {subTaskIdActive && (
        <SubTaskEquipmentModal
          open={isOpenJobTask['equipment']}
          onCancel={onCancelUpdateEquipment}
          data={jobSubTaskEquipmentsMap[subTaskIdActive] ?? []}
          onUpdate={handleUpdateEquipment}
        />
      )}
      <TemplateItemFormModal
        open={isOpenJobTask['template-item']}
        onCancel={() => handleCloseModal('template-item')}
        data={templateItemActive}
      />
      <AddItemSubTaskModal
        open={isOpenJobTask['add-item']}
        subTaskId={subTaskIdActive ?? ''}
        onCancel={() => handleCloseModal('add-item')}
      />
      <SubTaskItemImageModal
        subTaskId={subTaskIdActive}
        open={isOpenJobTask['add-item-image']}
        onCancel={handleCancelModalSubTaskItem}
      />
    </>
  );
};

export default memo(SubTaskDetailGroup);

type SubTaskHeaderActionProps = {
  onUpdateEquipment: (e: MouseEvent<HTMLElement>, subTaskId: string) => void;
  onAddItem: (e: MouseEvent<HTMLElement>, subTaskId: string) => void;
  subTaskId: string;
  item: JobSubTaskTemplate;
};

const SubTaskHeaderAction: React.FC<SubTaskHeaderActionProps> = ({ onUpdateEquipment, subTaskId, onAddItem, item }) => {
  const { pathname } = useLocation();
  const { updateJobSubTaskName } = useJobTask();
  const { jobId, milestoneId, id } = useParams();

  const onUpdateSubTaskStatus = useCallback(
    async (dragStatus: boolean) => {
      if (!jobId || !milestoneId || !id) return;
      try {
        updateJobSubTaskName(item.id, { name: item.name }, undefined, dragStatus);
        await JobTaskService.updateSubTask(jobId, milestoneId, id, subTaskId, {
          name: item.name,
          drag_status: dragStatus
        });
      } catch (error) {
        console.log('Update subtask error: ', error);
      }
    },
    [id, item.id, item.name, jobId, milestoneId, subTaskId, updateJobSubTaskName]
  );

  return (
    <Flex
      align="center"
      gap={6}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {!pathname.includes(pathNameTaskTemplate) && (
        <Switch
          onChange={(e) => onUpdateSubTaskStatus(e)}
          checkedChildren="Applicable"
          unCheckedChildren="Not Applicable"
          checked={item.drag_status}
        />
      )}
      <AppButton iconType="add" type="primary" onClick={(e) => onAddItem(e, subTaskId)}>
        Add Item
      </AppButton>
      {!pathname.includes(pathNameTaskTemplate) && (
        <AppButton iconType="edit" type="primary" ghost onClick={(e) => onUpdateEquipment(e, subTaskId)}>
          Update Equipment
        </AppButton>
      )}
    </Flex>
  );
};
