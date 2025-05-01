import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import ApiURL from '@/core/class/ApiURL';
import { AppButton, AppTable, PageFilter } from '@/core/components';
import { filtersCertificate } from '@/core/constants';
import { DateFormat, PathLabelEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { EmployeeService, MarketService } from '@/core/services';
import { Action, ActionType, Market } from '@/core/types';
import { DataHelper, LogHelper, ModalHelper } from '@/utils/helpers';
import { CertificateModal } from './components';
import dayjs from 'dayjs';
import { Image } from 'antd';

const CertificatePage = ({ employee, loading, fetchData, onCancelPopup }: any) => {
  const { t } = useTranslation(['button', 'message']);
  console.log('employee', employee);

  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>();
  const [dataSelected, setDataSelected] = useState<Market>();
  const [data, setData] = useState<any>([]);
  console.log('data', data);

  // const { loading, data, pagination, fetchData } = useData<Market>(ApiURL.market);
  const { isEmployee } = useRole();

  useEffect(() => {
    if (!open) {
      setDataSelected(undefined);
      setActionType(undefined);
    }
  }, [open]);

  const onEdit = useCallback((cert: any) => {
    setActionType('edit');
    setDataSelected(cert);
    setOpen(true);
  }, []);

  const fetchDataCert = async () => {
    try {
      const res = await EmployeeService.getEmployeeCertList(employee.id);

      if (res?.success) {
        setData(res.data);
      }
    } catch (error) {}
  };
  useEffect(() => {
    if (employee?.id) fetchDataCert();
  }, [employee]);
  const onDelete = useCallback(
    (cert: any) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'Certificate' }),
        async onOk() {
          try {
            const res = await EmployeeService.deleteEmployeeCert(employee.id, cert.id);
            if (res.success) {
              toast.success(t(['message:success']));
              fetchDataCert();
            }
          } catch (error) {
            LogHelper.logError(error);
          }
        }
      });
    },
    [t]
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
        ellipsis: true
      },
      {
        title: 'Image',
        dataIndex: 'document_id',
        key: 'document_id',
        ellipsis: true,
        render: (url: string) => <Image src={DataHelper.getUrlFile(url)} />
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        ellipsis: true
      },
      {
        title: 'Issue Date',
        dataIndex: 'issue_date',
        key: 'issue_date',
        ellipsis: true,
        render: (date: Date) => `${dayjs(date).format(DateFormat['DD/MM/YYYY'])}`
      },
      {
        title: 'Expiry Date',
        dataIndex: 'expire_date',
        key: 'expire_date',
        ellipsis: true,
        render: (date: Date) => `${dayjs(date).format(DateFormat['DD/MM/YYYY'])}`
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
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
        // title={PathLabelEnum.certificate}
        actions={
          !isEmployee && (
            <AppButton type="primary" ghost size="large" iconType="add" onClick={onAddMarket}>
              Add Certificate
            </AppButton>
          )
        }
      >
        <AppTable loading={loading} dataSource={data} columns={columns} actions={actions} />
      </MainLayout>
      <CertificateModal
        open={open}
        onCancel={() => setOpen(false)}
        actionType={actionType}
        data={dataSelected}
        fetchData={fetchDataCert}
        employee={employee}
      />
    </>
  );
};

export default CertificatePage;
