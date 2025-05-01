import { ColumnsType } from 'antd/es/table';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import ApiURL from '@/core/class/ApiURL';
import PathURL from '@/core/class/PathURL';
import { AppButton, AppTable, PageFilter } from '@/core/components';
import { filtersJob } from '@/core/constants';
import { DateFormat, JobStatusEnum, PathLabelEnum, PriorityEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { JobService } from '@/core/services';
import { Action, Job, JobTaskStatus, Priority } from '@/core/types';
import { DataHelper, FormatHelper, LogHelper, ModalHelper } from '@/utils/helpers';

const Jobs = () => {
  const { t } = useTranslation(['button', 'message']);
  const navigate = useNavigate();

  const { data, loading, pagination, fetchData } = useData<Job>(ApiURL.job);
  const { isEmployee } = useRole();

  const onAddJob = () => {
    navigate(`add`);
  };

  const onEdit = useCallback(
    (record: Job) => {
      navigate(`edit/${record.id}`);
    },
    [navigate]
  );

  const _onDelete = useCallback(
    (job: Job) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'job' }),
        async onOk() {
          try {
            const res = await JobService.deleteJob(job.id);
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
      { label: t(['button:edit']), callback: onEdit, type: 'edit' }
      // { label: t(['button:delete']), callback: onDelete, type: 'delete' }
    ];
  }, [t, onEdit, isEmployee]);

  const columns: ColumnsType<Job> = useMemo(() => {
    return [
      {
        title: 'Customer',
        dataIndex: 'customer_name',
        key: 'customer',
        width: 200
      },
      {
        title: 'Project',
        dataIndex: 'project_name',
        key: 'project',
        width: 200
      },
      {
        title: 'Job',
        dataIndex: 'name',
        key: 'job',
        render(value: string, record: Job) {
          return <Link to={`/${PathURL.jobs}/${record.id}`}>{value}</Link>;
        },
        ellipsis: true,
        width: 200
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render(status: JobTaskStatus) {
          return DataHelper.getEnumKeyByValue(status, JobStatusEnum);
        },
        width: 150
      },

      {
        title: 'Team',
        dataIndex: 'team_name',
        key: 'team',
        width: 200
      },
      {
        title: 'Forecast Start',
        dataIndex: 'start_date',
        key: 'start',
        render(value: string) {
          return FormatHelper.formatDate(value, DateFormat['MM/DD/YYYY']);
        },
        align: 'center',
        width: 150
      },
      {
        title: 'Forecast End',
        dataIndex: 'end_date',
        key: 'end',
        render(value: string) {
          return FormatHelper.formatDate(value, DateFormat['MM/DD/YYYY']);
        },
        align: 'center',
        width: 150
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        width: 120,
        render(value: Priority) {
          return DataHelper.getEnumKeyByValue(value, PriorityEnum);
        }
      }
    ];
  }, []);

  return (
    <MainLayout
      title={PathLabelEnum.jobs}
      actions={
        !isEmployee && (
          <AppButton size="large" type="primary" iconType="add" onClick={onAddJob}>
            {t(['add_job'])}
          </AppButton>
        )
      }
      filter={<PageFilter filters={filtersJob} screen="jobs" />}
    >
      <AppTable columns={columns} dataSource={data} loading={loading} {...pagination} actions={actions} />
    </MainLayout>
  );
};

export default Jobs;
