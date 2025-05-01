import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import ApiURL from '@/core/class/ApiURL';
import { AppButton, AppTable, PageFilter } from '@/core/components';
import { filtersTeam } from '@/core/constants';
import { PathLabelEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { TeamService } from '@/core/services';
import { Action, ActionType, Team } from '@/core/types';
import { LogHelper, ModalHelper } from '@/utils/helpers';
import { TeamModal } from './components';

const TeamsPage = () => {
  const { t } = useTranslation(['button', 'message']);

  const [open, setOpen] = useState(false);
  const [dataSelected, setDataSelected] = useState<Team>();
  const [actionType, setActionType] = useState<ActionType>();

  const { isEmployee, isPM } = useRole();

  const { loading, data, pagination, fetchData } = useData<Team>(ApiURL.team);

  useEffect(() => {
    if (!open) {
      setDataSelected(undefined);
      setActionType(undefined);
    }
  }, [open]);

  const onEdit = useCallback((team: Team) => {
    setActionType('edit');
    setDataSelected(team);
    setOpen(true);
  }, []);

  const onDelete = useCallback(
    (team: Team) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'team' }),
        async onOk() {
          try {
            const res = await TeamService.deleteTeam(team.id);
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
    if (isEmployee || isPM) return [];
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
  }, [t, onEdit, onDelete, isEmployee, isPM]);

  const columns: ColumnsType<Team> = useMemo(() => {
    return [
      {
        title: 'Team Name',
        dataIndex: 'name',
        key: 'teamName',
        width: '40%'
      },
      {
        title: 'PM Name',
        dataIndex: 'pm_name',
        key: 'pm_name',
        width: '40%'
      }
    ];
  }, []);

  const onAddTeam = () => {
    setActionType('add');
    setOpen(true);
  };

  return (
    <>
      <MainLayout
        title={PathLabelEnum.teams}
        actions={
          !isEmployee && (
            <AppButton type="primary" ghost size="large" iconType="add" onClick={onAddTeam}>
              {t(['add_team'])}
            </AppButton>
          )
        }
        filter={<PageFilter filters={filtersTeam} />}
      >
        <AppTable loading={loading} dataSource={data} columns={columns} actions={actions} {...pagination} />
      </MainLayout>
      <TeamModal
        actionType={actionType}
        open={open}
        onCancel={() => setOpen(false)}
        fetchData={fetchData}
        data={dataSelected}
      />
    </>
  );
};

export default TeamsPage;
