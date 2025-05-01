import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import ApiURL from '@/core/class/ApiURL';
import { AppButton, AppTable, PageFilter } from '@/core/components';
import { EquipmentTypes, filtersEquipments } from '@/core/constants';
import { PathLabelEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { EquipmentService } from '@/core/services';
import { Action, ActionType, Equipment } from '@/core/types';
import { LogHelper, ModalHelper } from '@/utils/helpers';
import { EquipmentModal } from './components';

const Equipments = () => {
  const { t } = useTranslation(['button', 'message']);

  const [actionType, setActionType] = useState<ActionType>();
  const [dataSelected, setDataSelected] = useState<Equipment>();
  const [isOpen, setIsOpen] = useState(false);

  const { loading, data, pagination, fetchData } = useData<Equipment>(ApiURL.equipment);
  const { isEmployee } = useRole();

  useEffect(() => {
    if (!isOpen) {
      setDataSelected(undefined);
      setActionType(undefined);
    }
  }, [isOpen]);

  const onEdit = useCallback((equipment: Equipment) => {
    setActionType('edit');
    setDataSelected(equipment);
    setIsOpen(true);
  }, []);

  const onDelete = useCallback(
    (equipment: Equipment) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'equipment' }),
        async onOk() {
          try {
            const res = await EquipmentService.deleteEquipment(equipment.id);
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

  const columns = useMemo<ColumnsType<Equipment>>(() => {
    return [
      {
        title: 'Equipment Name',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Manufacturer',
        dataIndex: 'manufacturer',
        key: 'manufacturer',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Part Number',
        dataIndex: 'part_number',
        key: 'partNumber',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        align: 'center',
        width: 150,
        ellipsis: true
      },
      {
        title: 'Model',
        dataIndex: 'model',
        key: 'model',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Weight',
        dataIndex: 'weight',
        key: 'weight',
        width: 100,
        ellipsis: true
      },
      {
        title: 'Height',
        dataIndex: 'height',
        key: 'height',
        width: 100,
        ellipsis: true
      },
      {
        title: 'Depth',
        dataIndex: 'depth',
        key: 'depth',
        width: 100,
        ellipsis: true
      },
      {
        title: 'Width',
        dataIndex: 'width',
        key: 'width',
        width: 100,
        ellipsis: true
      },
      {
        title: 'Details',
        dataIndex: 'details',
        key: 'details',
        width: 200,
        ellipsis: true
      },
      {
        title: 'Uom',
        dataIndex: 'uom',
        key: 'uom',
        width: 100,
        ellipsis: true
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        width: 200,
        render(value) {
          return EquipmentTypes.find((item) => item.value === value)?.label ?? '';
        },
        ellipsis: true
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        width: 100,
        ellipsis: true
      },
      {
        title: 'Sku',
        dataIndex: 'sku',
        key: 'sku',
        width: 100,
        ellipsis: true
      }
    ];
  }, []);

  return (
    <>
      <MainLayout
        title={PathLabelEnum.equipments}
        actions={
          !isEmployee && (
            <AppButton
              size="large"
              type="primary"
              ghost
              iconType="add"
              onClick={() => {
                setIsOpen(true);
                setActionType('add');
              }}
            >
              {t(['add_equipment'])}
            </AppButton>
          )
        }
        filter={<PageFilter filters={filtersEquipments} />}
      >
        <AppTable dataSource={data} loading={loading} columns={columns} actions={actions} {...pagination} />
      </MainLayout>
      <EquipmentModal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        actionType={actionType}
        data={dataSelected}
        fetchData={fetchData}
      />
    </>
  );
};

export default Equipments;
