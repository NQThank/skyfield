import { Card, Space, Tree, TreeDataNode, TreeProps, Typography } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { JobTaskService } from '@/core/services';
import { JobSubTaskTemplate } from '@/core/types';
import { useJobTask } from '@/store';
import { CommonHelper } from '@/utils/helpers';
import AppButton from '../../base/AppButton';
import SectorPositionModal from './SectorPositionModal';
import WrapperTextSubTask from './WrapperTextSubTask';
import { pathNameTaskTemplate } from '@/core/constants';

type SubTaskViewProps = {};

const { Text } = Typography;

const SubTaskView: React.FC<SubTaskViewProps> = () => {
  const { jobId, milestoneId, id } = useParams();
  const { jobSubTasks, updateJobSubTaskName, addSubTask, deleteSubTask, setIsUpdateTask } = useJobTask();

  const [jobSubTaskActive, setJobSubTaskActive] = useState<JobSubTaskTemplate>();
  const [open, setOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { pathname } = useLocation();

  const onUpdateSubTaskName = useCallback(
    async (
      data: { name: string; approve_required: boolean; item_required: boolean; marked: boolean },
      subTaskId: string,
      parentId?: string
    ) => {
      const { name, approve_required, item_required } = data;
      if (pathname.includes(pathNameTaskTemplate)) {
        updateJobSubTaskName(subTaskId, { name, approve_required, item_required }, parentId, true);
      } else {
        if (!jobId || !milestoneId || !id) return;
        try {
          await JobTaskService.updateSubTask(jobId, milestoneId, id, subTaskId, {
            name: data.name,
            approve_required: data.approve_required,
            item_required: data.item_required
          });
          updateJobSubTaskName(subTaskId, { name, approve_required, item_required }, parentId, true);
        } catch (error) {
          console.log('Update subtask error: ', error);
        }
      }
    },
    [id, jobId, milestoneId, pathname, updateJobSubTaskName]
  );

  const onAddSubTask = useCallback(
    (id: string) => {
      if (!expandedKeys.includes(id)) {
        setExpandedKeys((pre) => [...pre, id]);
      }
      addSubTask(
        {
          id: CommonHelper.generateStr(),
          name: 'Sub Task',
          order_value: 1,
          parent_id: id,
          status: 'init',
          drag_status: true
        },
        id
      );
    },
    [addSubTask, expandedKeys]
  );

  const onUpdateSectorPosition = (item: JobSubTaskTemplate) => {
    setOpen(true);
    setJobSubTaskActive(item);
  };

  const onAddSectorPosition = async () => {
    if (pathname.includes(pathNameTaskTemplate)) {
      addSubTask({
        id: CommonHelper.generateStr(),
        name: 'name',
        order_value: 1,
        status: 'init',
        drag_status: true
      });
    } else {
      if (!jobId || !milestoneId || !id) return;
      setSubmitting(true);
      try {
        const result = await JobTaskService.addSubTask(jobId, milestoneId, id, { name: 'Sub Task' });
        if (result.success && result.data) {
          addSubTask({
            id: result.data.id,
            name: result.data.name,
            order_value: 1,
            status: 'done',
            drag_status: true
          });
          setIsUpdateTask(true);
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  const onExpand: TreeProps['onExpand'] = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
  };

  const onDeleteSubTask = useCallback(
    async (subTaskId: string, parentId?: string) => {
      if (pathname.includes(pathNameTaskTemplate)) {
        deleteSubTask(subTaskId, parentId);
      } else {
        if (!jobId || !milestoneId || !id) return;
        try {
          await JobTaskService.deleteSubTask(jobId, milestoneId, id, subTaskId);
          deleteSubTask(subTaskId, parentId);
          setIsUpdateTask(true);
        } catch (error) {
          console.log('Delete subtask error: ', error);
        }
      }
    },
    [deleteSubTask, id, jobId, milestoneId, pathname]
  );

  const treeData = useMemo<TreeDataNode[]>(() => {
    return jobSubTasks.map<TreeDataNode>((item) => {
      if (!item.children)
        return {
          title: (
            <WrapperTextSubTask
              id={item.id}
              data={item}
              onSave={(data) => onUpdateSubTaskName(data as any, item.id)}
              onDelete={onDeleteSubTask}
            />
          ),
          key: item.id
        };
      return {
        title: (
          <WrapperTextSectorPosition
            title={item.name}
            onAddSubTask={onAddSubTask}
            onUpdateSectorPosition={() => onUpdateSectorPosition(item)}
          />
        ),
        key: item.id,
        children: item.children.map((el) => ({
          title: (
            <WrapperTextSubTask
              id={el.id}
              parentId={item.id}
              data={el}
              onSave={(data) => onUpdateSubTaskName(data as any, el.id, el.parent_id)}
              onDelete={onDeleteSubTask}
            />
          ),
          key: el.id
        }))
      };
    });
  }, [jobSubTasks, onUpdateSubTaskName, onAddSubTask, onDeleteSubTask]);

  const onCancelSectorPositionModal = () => {
    setOpen(false);
    setJobSubTaskActive(undefined);
  };

  return (
    <>
      <Card
        title="Sub Task"
        extra={
          <Space>
            {/* <ConfigProvider
              theme={{
                components: {
                  Switch: {
                    trackHeight: 28,
                    handleSize: 24,
                    innerMaxMargin: 28
                  }
                }
              }}
            >
              <Switch
                checked={sectorRequired}
                onChange={setSectorRequired}
                checkedChildren="Sector Position"
                unCheckedChildren="SubTask"
                size="default"
              />
            </ConfigProvider> */}
            <AppButton
              iconType="add"
              type="primary"
              ghost
              onClick={onAddSectorPosition}
              loading={submitting}
              title={'Add Sub Task'}
            >
              Add Sub Task
            </AppButton>
          </Space>
        }
      >
        <Tree showLine blockNode treeData={treeData} autoExpandParent expandedKeys={expandedKeys} onExpand={onExpand} />
      </Card>
      <SectorPositionModal open={open} onCancel={onCancelSectorPositionModal} data={jobSubTaskActive} />
    </>
  );
};

export default SubTaskView;

type WrapperTextSectorPositionProps = {
  title: string;
  onAddSubTask: (sectorPositionId: string) => void;
  onUpdateSectorPosition: () => void;
};

const WrapperTextSectorPosition: React.FC<WrapperTextSectorPositionProps> = ({
  title,
  onAddSubTask,
  onUpdateSectorPosition
}) => {
  const handleUpdate: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    onUpdateSectorPosition();
  };

  return (
    <div className="flex justify-between">
      <div>
        <Text>{title}</Text>{' '}
        <AppButton
          icon={<i className="fa-solid fa-pen-to-square" />}
          size="small"
          type="text"
          title="Update"
          onClick={handleUpdate}
        />
      </div>
      <AppButton
        type="primary"
        ghost
        size="small"
        iconType="add"
        title="Add Subtask"
        onClick={() => onAddSubTask(title)}
      >
        Add SubTask
      </AppButton>
    </div>
  );
};
