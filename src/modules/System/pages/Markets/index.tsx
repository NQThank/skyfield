import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import ApiURL from '@/core/class/ApiURL';
import { AppButton, AppTable, PageFilter } from '@/core/components';
import { filtersMarket } from '@/core/constants';
import { PathLabelEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { MarketService } from '@/core/services';
import { Action, ActionType, Market } from '@/core/types';
import { LogHelper, ModalHelper } from '@/utils/helpers';
import { MarketModal } from './components';

const Markets = () => {
  const { t } = useTranslation(['button', 'message']);

  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>();
  const [dataSelected, setDataSelected] = useState<Market>();

  const { loading, data, pagination, fetchData } = useData<Market>(ApiURL.market);
  const { isEmployee } = useRole();

  useEffect(() => {
    if (!open) {
      setDataSelected(undefined);
      setActionType(undefined);
    }
  }, [open]);

  const onEdit = useCallback((market: Market) => {
    setActionType('edit');
    setDataSelected(market);
    setOpen(true);
  }, []);

  const onDelete = useCallback(
    (market: Market) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'market' }),
        async onOk() {
          try {
            const res = await MarketService.deleteMarket(market.id);
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

  const columns: ColumnsType<Market> = useMemo(() => {
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '25%',
        ellipsis: true
      },
      {
        title: 'Wireless Carrier',
        dataIndex: 'wireless_carrier',
        key: 'wireless_carrier',
        width: '15%',
        ellipsis: true
      },
      {
        title: 'Carrier Address',
        dataIndex: 'carrier_address',
        key: 'carrier_address',
        width: '15%',
        ellipsis: true
      },
      {
        title: 'Carrier Logistic Location',
        dataIndex: 'carrier_logistic_location',
        key: 'carrier_logistic_location',
        width: '20%',
        ellipsis: true
      },
      {
        title: 'Notes',
        dataIndex: 'notes',
        key: 'notes',
        width: '25%',
        ellipsis: true
      }
    ];
  }, []);

  const onAddMarket = () => {
    setOpen(true);
    setActionType('add');
  };

  return (
    <>
      <MainLayout
        title={PathLabelEnum.markets}
        actions={
          !isEmployee && (
            <AppButton type="primary" ghost size="large" iconType="add" onClick={onAddMarket}>
              {t(['add_market'])}
            </AppButton>
          )
        }
        filter={<PageFilter filters={filtersMarket} />}
      >
        <AppTable loading={loading} dataSource={data} columns={columns} actions={actions} {...pagination} />
      </MainLayout>
      <MarketModal
        open={open}
        onCancel={() => setOpen(false)}
        actionType={actionType}
        data={dataSelected}
        fetchData={fetchData}
      />
    </>
  );
};

export default Markets;
