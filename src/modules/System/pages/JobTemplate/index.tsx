import { ColumnsType } from 'antd/es/table';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AppButton, AppTable, PageFilter } from '@/core/components';
import { filtersJobTemplate } from '@/core/constants';
import { PathEnum, PathLabelEnum, PriorityEnum, TemplateTypeEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { JobTemplateService } from '@/core/services';
import { Action, Priority, TaskTemplate, TaskTemplateType } from '@/core/types';
import { DataHelper, LogHelper, ModalHelper } from '@/utils/helpers';
import ApiURL from '@/core/class/ApiURL';

const JobTemplatePage = () => {
  const { t } = useTranslation(['button', 'message']);

  const navigate = useNavigate();

  const { loading, data, pagination, fetchData } = useData<TaskTemplate>(ApiURL.jobTemplate);
  const { isEmployee } = useRole();

  const onEdit = useCallback(
    (record: TaskTemplate) => {
      navigate(`/${PathEnum['job-templates']}/edit/${record.id}`);
    },
    [navigate]
  );
  const onDelete = useCallback(
    (project: TaskTemplate) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'job template' }),
        async onOk() {
          try {
            const res = await JobTemplateService.deleteJobTemplate(project.id);
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
        title: 'Job Template Name',
        dataIndex: 'name',
        key: 'name',
        width: '40%',
        ellipsis: true
      },

      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        width: '20%',
        render(value: TaskTemplateType) {
          return DataHelper.getEnumKeyByValue(value, TemplateTypeEnum);
        }
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        width: '20%',
        render(value: Priority) {
          return DataHelper.getEnumKeyByValue(value, PriorityEnum);
        }
      },
      {
        title: 'Scope',
        dataIndex: 'scope',
        key: 'scope',
        width: '20%'
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        width: '20%'
      }
    ];
  }, []);

  const onAddTaskTemplate = () => {
    navigate(`add`);
  };

  return (
    <MainLayout
      title={PathLabelEnum['job-templates']}
      actions={
        !isEmployee && (
          <AppButton size="large" type="primary" ghost iconType="add" onClick={onAddTaskTemplate}>
            {t(['add_job_template'])}
          </AppButton>
        )
      }
      filter={<PageFilter filters={filtersJobTemplate} />}
    >
      <AppTable columns={columns} loading={loading} dataSource={data} actions={actions} {...pagination} />
    </MainLayout>
  );
};

export default JobTemplatePage;
