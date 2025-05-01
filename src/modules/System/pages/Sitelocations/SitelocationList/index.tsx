import { ColumnsType } from 'antd/es/table';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import ApiURL from '@/core/class/ApiURL';
import { AppButton, AppTable, PageFilter } from '@/core/components';
import { filtersSitelocation } from '@/core/constants';
import { PathLabelEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { SitelocationService } from '@/core/services';
import { Action, Sitelocation } from '@/core/types';
import { LogHelper, ModalHelper } from '@/utils/helpers';

const Sitelocations = () => {
  const { t } = useTranslation(['button', 'message']);
  const navigate = useNavigate();

  const { loading, data, pagination, fetchData } = useData<Sitelocation>(ApiURL.sitelocation);
  const { isEmployee } = useRole();

  const onEdit = useCallback(
    (sitelocation: Sitelocation) => {
      navigate(`edit/${sitelocation.id}`);
    },
    [navigate]
  );

  const onDelete = useCallback(
    (sitelocation: Sitelocation) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'sitelocation' }),
        async onOk() {
          try {
            const res = await SitelocationService.deleteSitelocation(sitelocation.id);
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
      { label: t(['button:edit']), callback: onEdit, type: 'edit' },
      { label: t(['button:delete']), callback: onDelete, type: 'delete' }
    ];
  }, [t, onEdit, onDelete, isEmployee]);

  const columns: ColumnsType<Sitelocation> = useMemo(() => {
    return [
      {
        title: 'Site Location',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        width: 200,
        ellipsis: true
      },
      {
        title: 'County',
        dataIndex: 'county',
        key: 'county',
        width: 140,
        ellipsis: true
      },
      {
        title: 'Latitude',
        dataIndex: 'latitude',
        key: 'latitude',
        width: 120,
        ellipsis: true
      },
      {
        title: 'Longitude',
        dataIndex: 'longitude',
        key: 'longitude',
        width: 120,
        ellipsis: true
      },
      {
        title: 'Structure Owner',
        dataIndex: 'structural_owner',
        key: 'structureOwner',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Structure Name',
        dataIndex: 'structural_name',
        key: 'structureName',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Structure Type',
        dataIndex: 'structural_type',
        key: 'structureType',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Structure Height',
        dataIndex: 'structural_height',
        key: 'structureHeight',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Structure Code',
        dataIndex: 'structural_code',
        key: 'structureCode',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Mount Cl',
        dataIndex: 'mount_cl',
        key: 'mountCl',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Antennas Cl',
        dataIndex: 'antennas_cl',
        key: 'antennasCl',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Access Info',
        dataIndex: 'access_info',
        key: 'accessInfo',
        width: 200,
        ellipsis: true
      }
    ];
  }, []);

  const onAddSitelocation = () => {
    navigate('/sitelocations/add');
  };
  return (
    <MainLayout
      title={PathLabelEnum.sitelocations}
      actions={
        !isEmployee && (
          <AppButton size="large" type="primary" ghost iconType="add" onClick={onAddSitelocation}>
            {t(['add_sitelocation'])}
          </AppButton>
        )
      }
      filter={<PageFilter filters={filtersSitelocation} />}
    >
      <AppTable
        loading={loading}
        dataSource={data}
        columns={columns}
        actions={actions}
        showToggleColumn
        {...pagination}
      />
    </MainLayout>
  );
};

export default Sitelocations;
