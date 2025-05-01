import { Card, Col, Divider, Form, Input, Modal, Row, Spin, Table, Tabs, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AppButton, AppDatePicker } from '@/core/components';
import { DateFormat } from '@/core/enums';
import { useAppDispatch } from '@/core/hooks';
import { MainLayout } from '@/core/layout';
import { JobService, ProjectService } from '@/core/services';
import { JobDetail1 } from '@/core/types';
import { FormatHelper, LogHelper } from '@/utils/helpers';
import { setNameMap } from '../../common.slice';
import { CardMilestone } from '../../Jobs/JobDetail/components';
import GeneralTab from './component/GeneralTab';
import ModalForm from './component/ModalForm';
import PhotoGallery from './component/PhotoGallery';
import InformationaTab from './component/InformationaTab';
import { useTranslation } from 'react-i18next';
export function randomBetween1And50(number = 60) {
  return Math.floor(Math.random() * number) + 1;
}

const { TabPane } = Tabs;
const EditNewJob = () => {
  const [data, setData] = useState<{ working_hours: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(['button']);

  const dispatch = useAppDispatch();

  const { id, projectId } = useParams();

  const [open, setOpen] = useState(false);
  const [totalHour, setTotalHour] = useState(0);
  const [jobDetail, setJobDetail] = useState<JobDetail1 & { issues: any[] }>();

  const fetchJobDetail = useCallback(async () => {
    if (!id || !projectId) return;
    try {
      const { success, data } = await JobService.getJobById(id);
      const { data: dataProject } = await ProjectService.getProjectById(projectId || '');
      if (success && data) {
        setJobDetail(data as JobDetail1 & { issues: any[] });
        dispatch(setNameMap({ [id]: data.name ?? '', [projectId]: dataProject?.name }));
      }
    } catch (error) {
      LogHelper.logError(error);
    }
  }, [id, projectId, dispatch]);

  const fetchCheckinout = useCallback(
    async (params: any) => {
      if (!id) return;
      try {
        setLoading(true);
        const { success, data } = await JobService.getCheckinCheckout(id, {
          ...params,
          page_size: 1000,
          page_number: 1
        });
        if (success && data) {
          setData(data);
        }
      } catch (error) {
        LogHelper.logError(error);
      }
      setLoading(false);
    },
    [id]
  );

  useEffect(() => {
    setTotalHour(data.reduce((total, item) => total + item.working_hours, 0));
  }, [data]);

  useEffect(() => {
    fetchJobDetail();
    fetchCheckinout({});
  }, [fetchCheckinout, fetchJobDetail]);

  const onCancel = () => {
    setOpen(false);
  };

  const columns = useMemo(
    () => [
      {
        title: 'User Name',
        key: 'employee_name',
        dataIndex: 'employee_name'
      },
      {
        title: 'Date',
        key: 'checkin_time',
        dataIndex: 'checkin_time',
        render: (checkin_time: string) => {
          return FormatHelper.formatDate(checkin_time, DateFormat['MM/DD/YYYY']);
        }
      },
      {
        title: 'Check in',
        key: 'checkin_time',
        dataIndex: 'checkin_time',
        render: (checkin_time: string) => {
          return FormatHelper.formatDate(checkin_time, DateFormat['HH:mm']);
        }
      },
      {
        title: 'Check out',
        key: 'checkout_time',
        dataIndex: 'checkout_time',
        render: (checkout_time: string) => {
          return FormatHelper.formatDate(checkout_time, DateFormat['HH:mm']);
        }
      },
      {
        title: 'Working hours',
        key: 'working_hours',
        dataIndex: 'working_hours',
        render: (working_hours: number) => {
          return `${working_hours}h`;
        }
      },
      {
        title: ' Reason Note',
        key: 'reason_issue',
        dataIndex: 'reason_issue'
      }
    ],
    []
  );

  const onFinish = (values: any) => {
    const params = {
      searchDate: FormatHelper.formatDate(values.searchDate, DateFormat['YYYYMMDD']),
      employeeName: values?.employeeName || ''
    };
    fetchCheckinout(params);
  };

  return (
    <MainLayout title={jobDetail?.name ?? ''} actions={<Row align={'middle'} gutter={[12, 24]}></Row>}>
      <Spin spinning={loading}>
        <Row gutter={[12, 12]}>
          <Col xl={15} xxl={16} className="">
            <Tabs className="custom-tabs bg-transparent">
              <TabPane tab="General" key="1">
                {jobDetail && <GeneralTab jobDetail={jobDetail} loading={loading} />}
              </TabPane>
              <TabPane tab="Milestone & Task" key="2">
                <CardMilestone />
              </TabPane>
              <TabPane tab="Check in / Check out" key="3">
                <div className="flex justify-between">
                  <Typography.Title level={4}>Check in / check out</Typography.Title>
                  <span>Total working hours: {totalHour.toFixed(2)}h</span>
                </div>

                <div className="tab-content mt-4">
                  <div className="mb-4">
                    <Form onFinish={onFinish}>
                      <Row gutter={[12, 12]}>
                        <Col span={6}>
                          <Form.Item name="searchDate">
                            <AppDatePicker placeholder={'Date'} className="h-10 w-full" allowClear />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="employeeName">
                            <Input placeholder={'User'} allowClear className="h-10" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <AppButton
                            className="h-10"
                            type="primary"
                            ghost
                            htmlType="submit"
                            icon={<i className="fa-sharp fa-regular fa-magnifying-glass" />}
                          >
                            {t('search')}
                          </AppButton>
                        </Col>
                      </Row>
                    </Form>
                  </div>

                  <Table key={1} columns={columns} dataSource={data} loading={loading} />
                </div>
              </TabPane>
              <TabPane tab="Gallery" key="4">
                <div className="tab-content">
                  <PhotoGallery />
                </div>
              </TabPane>
            </Tabs>
          </Col>
          <Col xl={8}>
            <Card className="overflow-auto shadow-md">
              <div className="flex justify-between">
                <Typography.Title level={4}>Information</Typography.Title>
                <AppButton type="primary" ghost onClick={() => setOpen(true)}>
                  {'Update info'}
                </AppButton>
              </div>
              <Divider className="my-2" />
              {jobDetail && <InformationaTab job={jobDetail} open={open} />}
            </Card>
          </Col>
        </Row>
      </Spin>
      <Modal
        className="modalform__custom"
        title={<Typography.Title level={3}>Update Infomation job</Typography.Title>}
        open={open}
        onCancel={onCancel}
        footer={null}
      >
        <ModalForm onCancel={onCancel} fetchData={fetchJobDetail} />
      </Modal>
    </MainLayout>
  );
};

export default EditNewJob;
