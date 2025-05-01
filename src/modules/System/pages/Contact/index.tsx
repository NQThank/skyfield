import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import ApiURL from '@/core/class/ApiURL';
import { AppButton, AppTable, PageFilter } from '@/core/components';
import { ContactRoleEnum, PathLabelEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { ContactService } from '@/core/services';
import type { Action, ActionType, Contact } from '@/core/types';
import { DataHelper, LogHelper, ModalHelper } from '@/utils/helpers';
import { ContactModal } from './components';
import { filtersContact } from '@/core/constants';

const Contact = () => {
  const { t } = useTranslation(['button', 'message']);

  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>();
  const [dataSelected, setDataSelected] = useState<Contact>();

  const { loading, data, pagination, fetchData } = useData<Contact>(ApiURL.contact);
  const { isEmployee } = useRole();

  useEffect(() => {
    if (!open) {
      setDataSelected(undefined);
      setActionType(undefined);
    }
  }, [open]);

  const onEdit = useCallback((contact: Contact) => {
    setActionType('edit');
    setDataSelected(contact);
    setOpen(true);
  }, []);

  const onDelete = useCallback(
    (contact: Contact) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'contact' }),
        async onOk() {
          try {
            const res = await ContactService.deleteContact(contact.id);
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

  const columns: ColumnsType<Contact> = useMemo(() => {
    return [
      {
        title: 'Customer Name',
        dataIndex: 'customer_name',
        key: 'customer_name',
        ellipsis: true
      },
      {
        title: 'Phone Number',
        dataIndex: 'phone_number',
        key: 'phone_number',
        ellipsis: true
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        ellipsis: true
      },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        ellipsis: true,
        render: (value: string) => DataHelper.getEnumKeyByValue(value, ContactRoleEnum)
      },
      {
        title: 'Company Name',
        dataIndex: 'company',
        key: 'company',
        ellipsis: true
      }
    ];
  }, []);

  const onAddContact = () => {
    setOpen(true);
    setActionType('add');
  };

  return (
    <>
      <MainLayout
        title={PathLabelEnum.contact}
        actions={
          !isEmployee && (
            <AppButton type="primary" ghost size="large" iconType="add" onClick={onAddContact}>
              {'Add Contact'}
            </AppButton>
          )
        }
        filter={<PageFilter filters={filtersContact} />}
      >
        <AppTable loading={loading} dataSource={data} columns={columns} actions={actions} {...pagination} />
      </MainLayout>
      <ContactModal
        open={open}
        onCancel={() => setOpen(false)}
        actionType={actionType}
        data={dataSelected}
        fetchData={fetchData}
      />
    </>
  );
};

export default Contact;
