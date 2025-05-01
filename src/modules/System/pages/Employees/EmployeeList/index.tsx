import { Modal, Radio, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import ApiURL from '@/core/class/ApiURL';
import { AppButton, AppModal, AppTable, PageFilter } from '@/core/components';
import { EmployeeStatus, EmployeeTypes, filtersEmployee } from '@/core/constants';
import { PathLabelEnum } from '@/core/enums';
import { useData, useRole } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { EmployeeService } from '@/core/services';
import { Action, Employee, UserStatusType } from '@/core/types';
import { FormatHelper, LogHelper, ModalHelper } from '@/utils/helpers';
import { EmployeeStatusTag } from './components';
import EmployeeForm from '../EmployeeForm';
import EmployeeDetailPage from '../EmployeeDetail';

const Employees = () => {
  const { t } = useTranslation(['message', 'button']);

  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [status, setStatus] = useState<UserStatusType>();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [dataSelected, setDataSelected] = useState<Employee>();
  const [idSelect, setIdSelect] = useState<string>('');
  const [idSelectDetail, setIdSelectDetail] = useState<string>('');

  const { loading, data, pagination, fetchData } = useData<Employee>(ApiURL.employee);
  const { isEmployee } = useRole();

  useEffect(() => {
    !open && setDataSelected(undefined);
  }, [open]);

  useEffect(() => {
    if (!openAdd) {
      setIdSelect('');
    }
  }, [openAdd]);

  const onEdit = useCallback((employee: Employee) => {
    setIdSelect(employee.id);
    setOpenAdd(true);
  }, []);

  const onDelete = useCallback(
    (employee: Employee) => {
      ModalHelper.confirm({
        title: t(['message:confirm'], { name: 'employee' }),
        async onOk() {
          try {
            const res = await EmployeeService.deleteEmployee(employee.id);
            if (res.success && fetchData) {
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
  }, [isEmployee, t, onEdit, onDelete]);

  const columns = useMemo<ColumnsType<Employee>>(() => {
    return [
      {
        title: 'Full Name',
        dataIndex: 'full_name',
        key: 'full_name',
        width: '15%',
        ellipsis: true,
        render(value, record) {
          return (
            <Link
              to={`#`}
              onClick={() => {
                setOpenDetail(true);
                setIdSelectDetail(record.id);
              }}
            >
              {value}
            </Link>
          );
        }
      },
      {
        title: 'Phone',
        dataIndex: 'phone',
        key: 'phone',
        ellipsis: true,
        width: '10%'
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
        width: '10%'
      },
      {
        title: 'Company',
        dataIndex: 'company',
        key: 'company',
        ellipsis: true,
        width: '10%'
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        width: '10%',
        ellipsis: true
      },
      {
        title: 'User Type',
        dataIndex: 'type',
        key: 'type',
        ellipsis: true,
        align: 'center',
        width: '10%',
        render(type) {
          return EmployeeTypes.find((item) => item.value === type)?.label ?? '';
        }
      },
      {
        title: 'Hire Date',
        dataIndex: 'hire_date',
        key: 'hire_date',
        render(value) {
          return FormatHelper.formatDate(value, 'DD/MM/YYYY');
        },
        align: 'center',
        ellipsis: true,
        width: '10%'
      },
      {
        title: 'Termination Date',
        dataIndex: 'termination_date',
        key: 'termination_date',
        render(value) {
          return FormatHelper.formatDate(value, 'DD/MM/YYYY');
        },
        align: 'center',
        ellipsis: true,
        width: '10%'
      },

      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 160,
        fixed: 'right',
        align: 'center',
        render(status: UserStatusType) {
          return <EmployeeStatusTag status={status} />;
        }
      }
    ];
  }, [onDelete]);

  const onOk = async () => {
    if (!dataSelected?.id || !status) return;
    setConfirmLoading(true);

    try {
      const res = await EmployeeService.updateStatusEmployee(dataSelected.id, { status });
      if (res.success) {
        toast.success(t(['success']));
        setOpen(false);
        fetchData();
      }
    } finally {
      setConfirmLoading(false);
    }
  };
  return (
    <>
      <MainLayout
        title={PathLabelEnum.employees}
        actions={
          !isEmployee && (
            <AppButton
              size="large"
              type="primary"
              iconType="add"
              onClick={() => {
                setIdSelect('');
                setOpenAdd(true);
              }}
            >
              {t(['button:add_employee'])}
            </AppButton>
          )
        }
        filter={<PageFilter filters={filtersEmployee} />}
      >
        <AppTable loading={loading} columns={columns} dataSource={data} actions={actions} {...pagination} />
      </MainLayout>
      <AppModal
        open={open}
        onCancel={() => setOpen(false)}
        title="Update Status User"
        onOk={onOk}
        confirmLoading={confirmLoading}
      >
        <p className="mb-2 text-base text-gray-600">You want update status employee?</p>
        <div>
          <Radio.Group
            options={EmployeeStatus}
            optionType="default"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
      </AppModal>
      <Modal
        className="modalformEmployee__custom"
        title={<Typography.Title level={3}>{`${idSelect ? 'Edit' : 'Add'} User`} </Typography.Title>}
        open={openAdd}
        onCancel={() => setOpenAdd(false)}
        footer={null}
        destroyOnClose
      >
        <EmployeeForm onCancelPopup={() => setOpenAdd(false)} id={idSelect} fetchData={fetchData} />
      </Modal>
      <Modal
        className="modalformEmployee__custom"
        title={<Typography.Title level={3}>{`Detail User`} </Typography.Title>}
        open={openDetail}
        onCancel={() => setOpenDetail(false)}
        footer={null}
      >
        <EmployeeDetailPage id={idSelectDetail} />
      </Modal>
    </>
  );
};

export default Employees;
