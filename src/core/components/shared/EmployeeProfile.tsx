import { UserOutlined } from '@ant-design/icons';
import { Avatar, Col, Divider, Row, Skeleton } from 'antd';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Box } from '@/core/components';
import { EmployeeTypes } from '@/core/constants';
import { Employee } from '@/core/types';
import { DataHelper, FormatHelper } from '@/utils/helpers';
import { EmployeeStatusTag } from '@/modules/System/pages/Employees/EmployeeList/components';

export type Info = {
  icon?: JSX.Element;
  label?: string;
  dataIndex: keyof Employee;
  render?(data?: any): React.ReactNode;
};

const infosCommon: Info[] = [
  {
    icon: <i className="fa-regular fa-envelope" />,
    dataIndex: 'email',
    render(email?: string) {
      return email ? <Link to={`mailto:${email}`}>{email}</Link> : '';
    }
  },
  {
    icon: <i className="fa-light fa-phone" />,
    dataIndex: 'phone'
  },
  {
    icon: <i className="fa-regular fa-location-dot" />,
    dataIndex: 'address'
  }
];

type EmployeeProfileProps = {
  data?: Employee;
  loading?: boolean;
};

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ data, loading = false }) => {
  const infosDetail = useMemo<Info[]>(
    () => [
      {
        label: 'Full Name',
        dataIndex: 'full_name'
      },
      {
        label: 'First Name',
        dataIndex: 'first_name'
      },
      {
        label: 'Last Name',
        dataIndex: 'last_name'
      },
      {
        label: 'Phone Number',
        dataIndex: 'phone'
      },
      {
        label: 'Address',
        dataIndex: 'address'
      },
      {
        label: 'Company',
        dataIndex: 'company'
      },
      {
        label: 'Positions',
        dataIndex: 'positions'
      },
      {
        label: 'Hire Date',
        dataIndex: 'hire_date',
        render(hire_date) {
          return FormatHelper.formatDate(hire_date);
        }
      },
      {
        label: 'Termination Date',
        dataIndex: 'termination_date',
        render(termination_date) {
          return FormatHelper.formatDate(termination_date);
        }
      },
      {
        label: 'Payroll Type',
        dataIndex: 'payroll_type'
      },
      {
        label: 'Payroll Rate',
        dataIndex: 'payroll_rate'
      },
      {
        label: 'Notes',
        dataIndex: 'notes'
      }
    ],
    []
  );

  const employeeType = useMemo(() => EmployeeTypes.find((item) => item.value === data?.type)?.label ?? 'User', [data]);
  return (
    <Row gutter={[24, 12]}>
      <Col xl={6} md={8} xs={24}>
        <Box className="p-5">
          <div className="flex flex-col items-center">
            {loading && (
              <div className="mt-4 flex w-4/5 flex-col items-center gap-y-4">
                <Skeleton.Avatar active size={80} />
                <Skeleton active paragraph={{ width: ['100%', '100%', '100%', '100%'] }} title={{ width: '100%' }} />
              </div>
            )}
            {!loading && (
              <>
                {data?.avatar_path ? (
                  <Avatar src={DataHelper.getUrlFile(data?.avatar_path)} size={120} />
                ) : (
                  <Avatar icon={<UserOutlined />} size={120} />
                )}

                <h2 className="mt-1 text-base font-semibold">{data?.full_name ?? ''}</h2>
                <p className="mb-1">{employeeType}</p>
                <EmployeeStatusTag status={data?.status ?? 'active'} className="!mr-0" />
                <Divider />
                <div className="flex w-full flex-col gap-y-2">
                  {infosCommon.map(
                    ({ dataIndex, icon, render }) =>
                      !!data?.[dataIndex] && (
                        <div key={dataIndex} className="flex items-center gap-x-2">
                          <span>{icon}</span>
                          <span className="min-w-0 flex-1 truncate">
                            {render && data ? render(data?.[dataIndex]) : data?.[dataIndex]}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </>
            )}
          </div>
        </Box>
      </Col>
      <Col xl={18} md={16} xs={24}>
        <Box className="py-4">
          <h2 className="text-base font-semibold">Information Details</h2>
          <Divider className="!-mx-5 !mb-0 !mt-4" />
          <div className="flex flex-col ">
            {loading && (
              <Row gutter={[12, 48]} className="mt-8">
                {Array(4)
                  .fill(1)
                  .map((_, index) => (
                    <Col lg={12} sm={24} key={index}>
                      <Skeleton active paragraph={{ rows: 1, width: '100%' }} />
                    </Col>
                  ))}
              </Row>
            )}

            {!loading && (
              <Row className="border-0 border-b border-solid border-stone-200 py-4 last:border-none last:pb-0">
                {infosDetail.map(
                  ({ dataIndex, render, label }) =>
                    !!data?.[dataIndex] && (
                      <Col
                        key={dataIndex}
                        className="flex flex-col gap-y-1 border-0 border-b border-solid border-zinc-200 py-4"
                        lg={12}
                        sm={24}
                      >
                        <span className="text-base text-gray-600">{label}</span>
                        <div className="font-medium">
                          {render && data ? render(data?.[dataIndex]) : data?.[dataIndex]}
                        </div>
                      </Col>
                    )
                )}
              </Row>
            )}
          </div>
        </Box>
      </Col>
    </Row>
  );
};

export default EmployeeProfile;
