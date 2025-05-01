/* eslint-disable react-hooks/exhaustive-deps */
import PathURL from '@/core/class/PathURL';
import { AppDraggable, AppEmpty, AppTable } from '@/core/components';
import { DateFormat, JobStatusEnum, PriorityEnum } from '@/core/enums';
import { JobService } from '@/core/services';
import { JobDetail1, JobImage, JobMilestone } from '@/core/types';
import { DataHelper, FormatHelper, LogHelper } from '@/utils/helpers';
import { CloseOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Image,
  Modal,
  Progress,
  Row,
  Skeleton,
  Typography,
  UploadFile
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { orderBy } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadProps } from 'antd/lib';
import {
  faBars,
  faCalendarDays,
  faChartSimple,
  faCircleUser,
  faLocationDot,
  faPeopleGroup,
  faSignal
} from '@fortawesome/free-solid-svg-icons';
import images from '@/assets/icons/images.png';
export const columnAssignees = [
  {
    title: 'Full Name',
    key: 'full_name',
    dataIndex: 'full_name'
  },
  {
    title: 'Phone',
    key: 'phone',
    dataIndex: 'phone'
  },
  {
    title: 'Email',
    key: 'email',
    dataIndex: 'email'
  },
  {
    title: 'Company',
    key: 'company',
    dataIndex: 'company'
  },
  {
    title: 'Address',
    key: 'address',
    dataIndex: 'address'
  }
];
const statusIcons = {
  scheduled: <FontAwesomeIcon icon={['fas', 'spinner']} className="mr-2" />,
  completed: <FontAwesomeIcon icon={['fas', 'circle-check']} className="mr-2" />,
  not_started: <></>,
  in_progress: <FontAwesomeIcon icon={['fas', 'spinner']} className="mr-2" />,
  late: <FontAwesomeIcon icon={['fas', 'exclamation-circle']} className="mr-2" />,
  init: <FontAwesomeIcon icon={['fas', 'circle']} className="mr-2" />,
  done: <FontAwesomeIcon icon={['fas', 'circle-check']} className="mr-2" />
};

const RenderDocuments = ({ id }: { id: string }) => {
  const [_loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);

  const fetchDocuments = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, success } = await JobService.getDocumentsByJobId(id);
      if (success && data) {
        const formattedFileList = Object.keys(data).map((item) => ({
          uid: FormatHelper.getUUIDFromPathFile(data[item]),
          name: item,
          status: 'done',
          percent: 100,
          type: 'old',
          url: DataHelper.getUrlFile(data[item])
        }));
        setFileList(
          formattedFileList.map((item) => ({
            ...item,
            status: 'done'
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    onRemove: () => false
  };

  return (
    <div className="customer_listDocument">
      <AppDraggable {...uploadProps} />
    </div>
  );
};

const JobInfo = ({ job }: { job: JobDetail1 }) => {
  return (
    <Row gutter={[0, 12]}>
      {[
        { label: 'Status', icon: faSignal, value: DataHelper.getEnumKeyByValue(job.status, JobStatusEnum) },
        {
          label: 'Start Date',
          icon: faCalendarDays,
          value: FormatHelper.formatDate(job.start_date, DateFormat['MM/DD/YYYY'])
        },
        {
          label: 'End Date',
          icon: faCalendarDays,
          value: FormatHelper.formatDate(job.end_date, DateFormat['MM/DD/YYYY'])
        },
        { label: 'Customer', icon: faCircleUser, value: job.project?.customer_name },
        {
          label: 'Location',
          icon: faLocationDot,
          value: job?.site_location?.map((item) => item.name).join(', ') ?? ''
        },
        { label: 'Priority', icon: faChartSimple, value: DataHelper.getEnumKeyByValue(job.priority, PriorityEnum) },
        { label: 'Team', icon: faPeopleGroup, value: job.team ? job.team.map((item) => item.name).join(', ') : '' }
      ].map(({ label, icon, value }) => (
        <React.Fragment key={label}>
          <Col xl={12}>
            <div className="flex items-center gap-x-4">
              <FontAwesomeIcon icon={icon} />
              <span className="text-base font-semibold">{label}</span>
            </div>
          </Col>
          <Col xl={12} className="mt-1">
            {value || ''}
          </Col>
        </React.Fragment>
      ))}
    </Row>
  );
};

const Milestones = ({ milestones, loading }: { milestones: JobMilestone[]; loading: boolean }) => (
  <>
    <Progress className="w-100" percent={75} status="active" strokeColor={{ from: '#108ee9', to: '#87d068' }} />
    <div className="scrollbar flex w-full gap-4 overflow-auto py-4">
      {loading
        ? Array.from({ length: 3 }).map((_, index) => (
            <Col xxl={6} xl={8} key={index}>
              <Skeleton active title={false} paragraph={{ width: ['100%', '100%', '100%'], rows: 3 }} />
            </Col>
          ))
        : milestones.map((item) => {
            return (
              <div
                key={item.id}
                className={`w-[200px] rounded-[4px] border border-indigo-600 p-2 text-white ${
                  item.status === 'init' ? 'bg-[#8f8a8a]' : item.status === 'done' ? 'bg-[#55ce63]' : 'bg-[#fb923c]'
                }`}
              >
                <div className="w-[200px] text-center">
                  {statusIcons[item.status || 'init']}
                  {item.name}
                </div>
                <div className="mt-4 flex justify-around">
                  <label>End Date</label>
                  <span>{FormatHelper.formatDate(item.end_date, DateFormat['MM/DD/YYYY'])}</span>
                </div>
              </div>
            );
          })}
    </div>
  </>
);
const renderItems = (items: any[], icon: any, labelFn: (item: any) => string, valueFn: (item: any) => string) =>
  items.map((item) => {
    return (
      <div
        key={item.id}
        className="mt-2 flex w-full items-center justify-between rounded-[4px] border border-[#000] bg-[#ccc] px-4 py-3"
      >
        <div className="flex gap-2 text-center">
          <FontAwesomeIcon icon={icon} />
          {labelFn(item)}
        </div>
        <div className="flex justify-around">{valueFn(item)}</div>
      </div>
    );
  });

const JobDetail: React.FC<{ job: JobDetail1 }> = ({ job }) => {
  const { id } = job;
  const [jobMilestones, setJobMilestones] = useState<JobMilestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [dataCheckInOut, setDataCheckInOut] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [assignees, setAssignees] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [milestonesRes, documentsRes, imagesRes, checkinoutRes, equipmentRes, assigneesRes] = await Promise.all([
        JobService.getMilestonesByJobId(id),
        JobService.getDocumentsByJobId(id),
        JobService.getGalleryById(id),
        JobService.getCheckinCheckout(id, {}),
        JobService.getEquipmentsByJobId(id),
        JobService.getJobByIdAssignee(id)
      ]);

      if (milestonesRes.success) {
        setJobMilestones(orderBy(milestonesRes.data ?? [], ['order_value'], 'asc'));
      }

      if (documentsRes.success) {
        setDocuments(documentsRes.data ? Object.keys(documentsRes.data) : []);
      }

      if (imagesRes.success && imagesRes.data) {
        const uploadedImages = imagesRes.data
          .filter((item: JobImage) => item.status === 'UPLOADED')
          .map((item: JobImage) => item.url);
        setGalleryImages(uploadedImages);
      }

      if (checkinoutRes.success && checkinoutRes.data) {
        setDataCheckInOut(checkinoutRes.data);
      }
      if (assigneesRes.success && assigneesRes.data) {
        setAssignees(assigneesRes.data);
      }
      if (equipmentRes.success && equipmentRes.data) {
        setEquipment(equipmentRes.data);
      }
    } catch (error) {
      LogHelper.logError(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData, id]);
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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Typography.Title level={4}>Description</Typography.Title>
        <TextArea
          className="pointer-events-none"
          value={job.description}
          readOnly
          autoSize={{ minRows: 5, maxRows: 5 }}
        />
      </div>
      <div className="mt-5">
        <Typography.Title level={4}>Information</Typography.Title>
        <Divider className="my-2" />
        <JobInfo job={job} />
      </div>
      <div className="mt-5">
        <Typography.Title level={4}>Milestone & Task</Typography.Title>
        <Divider className="my-2" />
        {jobMilestones.length > 0 ? <Milestones milestones={jobMilestones} loading={loading} /> : <AppEmpty />}
      </div>

      <div className="mt-5">
        <Typography.Title level={4}>Equipment</Typography.Title>
        <Divider className="my-2" />
        {equipment.length > 0 ? (
          renderItems(
            equipment,
            ['fas', 'computer'],
            (item) => item.name,
            (item) => `Quantity: ${item.quantity || 0}`
          )
        ) : (
          <AppEmpty />
        )}
      </div>
      <div className="mt-5">
        <Typography.Title level={4}>Check in / Check out </Typography.Title>
        <Divider className="my-2" />
        <AppTable key={1} columns={columns} dataSource={dataCheckInOut} loading={loading} />
      </div>
      <div className="mt-5">
        <Typography.Title level={4}>User </Typography.Title>
        <Divider className="my-2" />
        <AppTable key={1} columns={columnAssignees} dataSource={assignees} loading={loading} />
      </div>
      <div className="mt-5">
        <Typography.Title level={4}>Notes</Typography.Title>
        <Divider className="my-2" />
        {job?.job_issues.length > 0 ? (
          (job?.job_issues || []).map((item) => <IssueItem data={item} key={item.id} jobId={job.id} />)
        ) : (
          <AppEmpty />
        )}

        {}
      </div>
      <div className="mt-5">
        <Typography.Title className="my-0" level={4}>
          Documents
        </Typography.Title>
        <Divider className="my-2" />
        {documents.length > 0 ? <RenderDocuments id={job.id} /> : <AppEmpty />}
      </div>
      {galleryImages.length > 0 && <ImageGallery images={galleryImages} />}
    </div>
  );
};

const ImageGallery = ({ images }: { images: string[] }) => (
  <div>
    <Typography.Title level={4}>Gallery</Typography.Title>
    <Divider className="my-2" />
    <Row gutter={16}>
      {images.slice(0, 6).map((src, index) => (
        <Col span={4} key={index}>
          <Image
            className="rounded"
            src={DataHelper.getUrlFile(src)}
            alt={`Gallery Image ${index + 1}`}
            preview
            width={75}
            height={75}
          />
        </Col>
      ))}
    </Row>
    <Row gutter={16} className="mt-4">
      {images.slice(6, 12).map((src, index) => (
        <Col span={4} key={index}>
          <Image src={DataHelper.getUrlFile(src)} alt={`Gallery Image ${index + 7}`} preview width={75} height={75} />
        </Col>
      ))}
    </Row>
  </div>
);

const JobDrawer: React.FC<{ visible: boolean; onClose: () => void; job: JobDetail1 }> = ({ visible, onClose, job }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  return (
    <Drawer
      placement="right"
      closable={false}
      onClose={onClose}
      open={visible}
      width={600}
      height="100vh"
      style={{ overflowY: 'auto' }}
      title={
        <div className="flex justify-between">
          <Button
            icon={<CloseOutlined className="text-black" />}
            type="link"
            onClick={onClose}
            style={{ fontSize: '18px' }}
          />
          <Button onClick={() => navigate(`/${PathURL.projects}/${projectId}/jobs/${job.id}`)} type="default">
            Update
          </Button>
        </div>
      }
    >
      {job && <JobDetail job={job} />}
    </Drawer>
  );
};

const ModalJobDetail: React.FC<{
  id: string | null;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ id, open, setOpen }) => {
  const [jobDetail, setJobDetail] = useState<JobDetail1 | undefined>();

  const fetchJobDetail = useCallback(async () => {
    if (!id) return;
    try {
      const { success, data } = await JobService.getJobById(id);

      if (success && data) {
        setJobDetail(data);
      }
    } catch (error) {
      LogHelper.logError(error);
    }
  }, [id]);

  useEffect(() => {
    fetchJobDetail();
  }, [fetchJobDetail]);

  return jobDetail ? <JobDrawer visible={open} onClose={() => setOpen(false)} job={jobDetail} /> : null;
};

const IssueItem = ({ data, jobId }: { data: any; jobId: string }) => {
  const [listImage, setListImage] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    if (!data.id || !jobId) return;
    const res = await JobService.getListImageIssue(jobId, data.id);
    if (res.success) {
      setListImage(res.data.url_list);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  return (
    <>
      <div className="flex cursor-pointer gap-x-4" onClick={() => setOpen(true)}>
        <div className="mt-2 flex w-full items-center gap-x-5 rounded-[4px] border border-[#000] bg-[#ccc] p-2">
          <img className="rounded" src={images} width={50} height={50} style={{ pointerEvents: 'none' }} />
          <div className="flex flex-col gap-2">
            <div>{data.name}</div>
            <div>{data.date}</div>
          </div>
        </div>
      </div>
      <Modal title="Note Detail" visible={open} onCancel={() => setOpen(false)} footer={null}>
        <Row gutter={[12, 0]}>
          <Col md={24} sm={24} xs={24}>
            <Form.Item name="name" label="Name Note" className="mb-0">
              {data.name}
            </Form.Item>
            <Form.Item name="description" label="Date" className="mb-0">
              {FormatHelper.formatDate(data.create_at, DateFormat['MM/DD/YYYY'])}
            </Form.Item>
            <Form.Item name="description" label="Description" className="mb-0">
              {data.description}
            </Form.Item>

            <Form.Item label="Image" className="mb-0">
              <Row gutter={[12, 12]} className="mt-4">
                {listImage.map((item) => (
                  <Col xxl={6} xl={6} key={item}>
                    <Image width={80} height={80} src={DataHelper.getUrlFile(item)} alt="Image issue" preview />
                  </Col>
                ))}
              </Row>
            </Form.Item>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default ModalJobDetail;
