import { ColumnsType } from 'antd/es/table';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import ApiURL from '@/core/class/ApiURL';
import { AppButton, AppTable, PageFilter } from '@/core/components';
import { filtersTaskTemplate } from '@/core/constants';
import { LocationTypeEnum, PathLabelEnum, PriorityEnum, TemplateTypeEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { TaskTemplateService } from '@/core/services';
import { Action, LocationType, Priority, TaskTemplate, TaskTemplateType } from '@/core/types';
import { DataHelper, LogHelper, ModalHelper } from '@/utils/helpers';

const TaskTemplatePage = () => {
  const { t } = useTranslation(['button', 'message']);

  const navigate = useNavigate();

  const { loading, data, pagination, fetchData } = useData<TaskTemplate>(ApiURL.taskTemplate);
  const { isEmployee } = useRole();

  const onEdit = useCallback(
    (record: TaskTemplate) => {
      navigate(`edit/${record.id}`);
    },
    [navigate]
  );
  const onDelete = useCallback(
    (project: TaskTemplate) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'task template' }),
        async onOk() {
          try {
            const res = await TaskTemplateService.deleteTaskTemplate(project.id);
            if (res.success) {
              toast.success(t(['message:success']));
              fetchData();
            }
          } catch (error) {
            LogHelper.logError(error);
          }
        }
      });
    },
    [fetchData, t]
  );

  const actions = useMemo<Action[]>(() => {
    if (isEmployee) return [];
    return [
      {
        label: t(['edit']),
        type: 'edit',
        callback: onEdit
      },
      {
        label: t(['delete']),
        type: 'delete',
        callback: onDelete
      }
    ];
  }, [t, onEdit, onDelete, isEmployee]);

  const columns = useMemo<ColumnsType<TaskTemplate>>(() => {
    return [
      {
        title: 'Task Name',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true
      },
      {
        title: 'Location Type',
        dataIndex: 'location_type',
        key: 'location_type',
        render(value: LocationType) {
          return DataHelper.getEnumKeyByValue(value, LocationTypeEnum);
        }
      },
      {
        title: 'Numbers of Man',
        dataIndex: 'number_of_men',
        key: 'number_of_men'
      },
      {
        title: 'Man Hours',
        dataIndex: 'total_working_hour',
        key: 'total_working_hour'
      }
    ];
  }, []);

  const onAddTaskTemplate = () => {
    navigate(`add`);
  };

  return (
    <MainLayout
      title={PathLabelEnum['task-templates']}
      actions={
        !isEmployee && (
          <AppButton size="large" type="primary" ghost iconType="add" onClick={onAddTaskTemplate}>
            {t(['add_task_template'])}
          </AppButton>
        )
      }
      filter={<PageFilter filters={filtersTaskTemplate} />}
    >
      <AppTable columns={columns} loading={loading} dataSource={data} actions={actions} {...pagination} />
    </MainLayout>
  );
};

export default TaskTemplatePage;
