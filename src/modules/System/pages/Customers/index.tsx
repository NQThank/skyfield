import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import ApiURL from '@/core/class/ApiURL';
import { AppButton, AppTable, PageFilter } from '@/core/components';
import { filtersCustomer } from '@/core/constants';
import { PathLabelEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { CustomerService } from '@/core/services';
import { Action, ActionType, Customer } from '@/core/types';
import { LogHelper, ModalHelper } from '@/utils/helpers';
import { CustomerModal, CustomerStatusTag } from './components';

const Customers = () => {
  const { t } = useTranslation(['message', 'button']);

  const [open, setOpen] = useState(false);
  const [dataSelected, setDataSelected] = useState<Customer>();
  const [actionType, setActionType] = useState<ActionType>();

  const { loading, data, pagination, fetchData } = useData<Customer>(ApiURL.customer);
  const { isEmployee } = useRole();

  useEffect(() => {
    if (!open) {
      setDataSelected(undefined);
      setActionType(undefined);
    }
  }, [open]);

  const onEdit = useCallback((customer: Customer) => {
    setActionType('edit');
    setDataSelected(customer);
    setOpen(true);
  }, []);

  const onDelete = useCallback(
    (customer: Customer) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'customer' }),
        async onOk() {
          try {
            const res = await CustomerService.deleteCustomer(customer.id);
            if (res.success) {
              toast.success(t('success'));
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

  const columns: ColumnsType<Customer> = useMemo(() => {
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true
      },
      {
        title: 'Website',
        dataIndex: 'website',
        key: 'website',
        ellipsis: true
      },
      // {
      //   title: 'Contact Name',
      //   dataIndex: 'contact_name',
      //   key: 'contact_name',
      //   width: '10%',
      //   ellipsis: true
      // },
      // {
      //   title: 'Contact Phone',
      //   dataIndex: 'contact_phone',
      //   key: 'contact_phone',
      //   width: '10%',
      //   ellipsis: true
      // },
      // {
      //   title: 'Contact Email',
      //   dataIndex: 'contact_email',
      //   key: 'contact_email',
      //   width: '12%',
      //   ellipsis: true
      // },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        ellipsis: true
      },
      {
        title: 'Company',
        dataIndex: 'company',
        key: 'company',
        ellipsis: true
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render(status) {
          return <CustomerStatusTag status={status} />;
        }
      }
      // {
      //   title: 'Contract Status',
      //   dataIndex: 'contract_status',
      //   key: 'contract_status',
      //   width: 140,
      //   render(status) {
      //     return <CustomerStatusTag status={status} />;
      //   }
      // }
    ];
  }, []);

  const onAdd = () => {
    setOpen(true);
    setActionType('add');
  };

  return (
    <>
      <MainLayout
        title={PathLabelEnum.customers}
        actions={
          !isEmployee && (
            <AppButton size="large" type="primary" ghost iconType="add" onClick={onAdd}>
              {t('button:add_customer')}
            </AppButton>
          )
        }
        filter={<PageFilter filters={filtersCustomer} />}
      >
        <AppTable loading={loading} dataSource={data} columns={columns} actions={actions} {...pagination} />
      </MainLayout>
      <CustomerModal
        open={open}
        onCancel={() => setOpen(false)}
        data={dataSelected}
        actionType={actionType}
        fetchData={fetchData}
      />
    </>
  );
};

export default Customers;
