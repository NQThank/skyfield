/* eslint-disable react-hooks/exhaustive-deps */
import { CloseOutlined } from '@ant-design/icons';
import {
  faBars,
  faCalendarDays,
  faChartSimple,
  faCircleUser,
  faLocationDot,
  faPeopleGroup,
  faSignal
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Divider, Form, Image, Modal, Row, Spin, Typography, UploadFile, UploadProps } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import ApiURL from '@/core/class/ApiURL';
import { AppButton, AppDraggable, AppEmpty, AppTable } from '@/core/components';
import { DateFormat, JobStatusEnum, PriorityEnum } from '@/core/enums';
import { useData } from '@/core/hooks';
import { FileService, JobService } from '@/core/services';
import { Employee, Equipment, JobDetail1, Team } from '@/core/types';
import { DataHelper, FormatHelper, LogHelper, ModalHelper } from '@/utils/helpers';
import ModalEquipment from './ModalEquipment';
import ModalIssue from './ModalIssue';
import images from '@/assets/icons/images.png';
import { columnAssignees } from '../../DetailJob/ModalJobDetail';

type Props = {
  job: JobDetail1 & { issues: any[] };
  open: boolean;
};

const IconWithLabel = ({ icon, label, value }: { icon: any; label: string; value: string | undefined }) => (
  <>
    <Col xl={12}>
      <div className="flex items-center gap-x-4">
        <FontAwesomeIcon icon={icon} />
        <span className="text-base font-semibold">{label}</span>
      </div>
    </Col>
    <Col xl={12} className="mt-1">
      {value}
    </Col>
  </>
);

const InformationaTab = ({ job, open }: Props) => {
  const { data: teams } = useData<Team>(ApiURL.team);
  const { data: employees } = useData<Employee>(ApiURL.employee);
  const { id } = useParams();

  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDocumentIds, setDeleteDocumentIds] = useState<string[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [openEquipment, setOpenEquipment] = useState(false);
  const [openIssue, setOpenIssue] = useState(false);
  const [assignees, setAssignees] = useState<any[]>([]);

  const fetchDocuments = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, success } = await JobService.getDocumentsByJobId(id);
      if (success && data) {
        const _fileList: any = Object.keys(data).map((item) => ({
          uid: FormatHelper.getUUIDFromPathFile(data[item]),
          name: item,
          status: 'done',
          percent: 100,
          type: 'old',
          url: DataHelper.getUrlFile(data[item])
        }));
        setFileList(_fileList);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);
  const fetchEquipment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, success } = await JobService.getEquipmentsByJobId(id);
      if (success && data) {
        setEquipment(data);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);
  const fetchIssues = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, success } = await JobService.getIssuesById(id);
      if (success && data) {
        setIssues(data);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);
  const fetchAssignees = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, success } = await JobService.getJobByIdAssignee(id);
      if (success && data) {
        setAssignees(data);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    fetchDocuments();
    fetchIssues();
    fetchEquipment();
    fetchAssignees();
  }, [fetchAssignees, fetchDocuments, fetchEquipment, fetchIssues]);
  useEffect(() => {
    fetchAssignees();
  }, [open]);
  useEffect(() => {
    if (deleteDocumentIds.length > 0) onUpdateDocument();
  }, [deleteDocumentIds]);
  const props: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    onChange({ file, fileList }) {
      setFileList(fileList);
      if (file.status === 'done') onUpdateDocument();
      else if (file.status === 'error') toast.error(`${file.name} file upload failed.`);
    },
    async onRemove(file) {
      if (file.type === 'old') setDeleteDocumentIds((ids) => [...ids, file.uid]);
      setFileList((list) => (list ? list.filter((item) => item.uid !== file.uid) : []));
    }
  };

  const onUpdateDocument = async () => {
    if (!id) return;
    try {
      setSubmitting(true);
      const add_document_ids = [];
      const filesToAdd = fileList.filter((item) => item.type !== 'old');
      if (filesToAdd.length) {
        const formData = new FormData();
        filesToAdd.forEach((file) => formData.append('files', file?.originFileObj as Blob));
        const res = await FileService.uploadFile(formData);
        if (res.success && res.data) add_document_ids.push(...FormatHelper.getFileIds(res.data));
      }
      const { success } = await JobService.updateDocument(id, {
        add_document_ids,
        delete_document_ids: deleteDocumentIds
      });
      if (success) {
        fetchDocuments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Row gutter={[12, 12]}>
        <IconWithLabel icon={faSignal} label="Status" value={DataHelper.getEnumKeyByValue(job.status, JobStatusEnum)} />
        <IconWithLabel
          icon={faCalendarDays}
          label="Start Date"
          value={FormatHelper.formatDate(job.start_date, DateFormat['MM/DD/YYYY'])}
        />
        <IconWithLabel
          icon={faCalendarDays}
          label="End Date"
          value={FormatHelper.formatDate(job.end_date, DateFormat['MM/DD/YYYY'])}
        />
        {/* <IconWithLabel icon={faBars} label="Scope of work" value={job.scope_of_work} /> */}
        <IconWithLabel icon={faCircleUser} label="Customer" value={job.project?.customer_name} />
        <IconWithLabel
          icon={faLocationDot}
          label="Location"
          value={job.site_location?.map((item) => item.name).join(', ')}
        />
        <IconWithLabel
          icon={faChartSimple}
          label="Priority"
          value={DataHelper.getEnumKeyByValue(job.priority, PriorityEnum)}
        />

        <Col xl={12}>
          <div className="flex items-center gap-x-4">
            <FontAwesomeIcon icon={faPeopleGroup} />
            <span className="text-base font-semibold">{'Team'}</span>
          </div>
        </Col>
        <Col xl={12}>{job?.team && job?.team.map((item) => item.name).join(', ')}</Col>
        <Col xl={12}>{employees?.find((item) => item.id === job?.team?.id)?.full_name}</Col>
      </Row>
      <Section
        title={
          <>
            <div className="flex justify-between">
              <span className="text-xl">Equipments</span>
              <AppButton type="primary" ghost onClick={() => setOpenEquipment(true)} loading={submitting}>
                {'Add equipment'}
              </AppButton>
            </div>
            <Divider className="my-4" />
          </>
        }
      >
        {equipment.length > 0 ? (
          equipment.map((item: Equipment) => (
            <EquipmentItem
              key={item.id}
              name={item.name}
              idEquipment={item.id}
              quantity={item.quantity || 0}
              fetchData={fetchEquipment}
            />
          ))
        ) : (
          <AppEmpty />
        )}
      </Section>

      <div className="mt-5">
        <Typography.Title level={4}>User </Typography.Title>
        <Divider className="my-2" />
        <AppTable key={1} columns={columnAssignees} dataSource={assignees} loading={loading} />
      </div>
      <Section
        title={
          <>
            <div className="flex justify-between">
              <span className="text-xl"> Documents</span>
            </div>
            <Divider className="my-4" />
          </>
        }
      >
        <Spin spinning={loading}>
          <AppDraggable {...props} />
        </Spin>
      </Section>

      <Section
        title={
          <>
            <div className="flex justify-between">
              <span className="text-xl"> Notes</span>
              <AppButton type="primary" ghost onClick={() => setOpenIssue(true)} loading={submitting}>
                Add Note
              </AppButton>
            </div>
            <Divider className="my-4" />
          </>
        }
      >
        {issues.length > 0 ? (
          issues.map((item) => (
            <IssueItem data={item} key={item.id} idIssue={item.id} jobId={id || ''} fetchData={fetchIssues} />
          ))
        ) : (
          <AppEmpty />
        )}
      </Section>
      <Modal
        title={<Typography.Title level={3}>Add Note</Typography.Title>}
        open={openIssue}
        onCancel={() => setOpenIssue(false)}
        footer={null}
      >
        <ModalIssue fetchData={fetchIssues} onCancel={() => setOpenIssue(false)} />
      </Modal>
      <Modal title="Add equipment" open={openEquipment} onCancel={() => setOpenEquipment(false)} footer={null}>
        <ModalEquipment onCancel={() => setOpenEquipment(false)} fetchData={fetchEquipment} />
      </Modal>
    </>
  );
};

const Section = ({ title, children, data, renderItem }: any) => (
  <div className="mt-10">
    <Typography.Title level={3}>{title}</Typography.Title>
    {data ? data.map(renderItem) : children}
  </div>
);

const EquipmentItem = ({
  name,
  idEquipment,
  quantity,
  fetchData
}: {
  name: string;
  idEquipment: string;
  quantity: number;
  fetchData: () => void;
}) => {
  const { id } = useParams();
  const { t } = useTranslation(['button', 'message']);
  const onDelete = useCallback(() => {
    if (!id) return;
    ModalHelper.confirm({
      title: 'Are you sure delete this equiqment?',
      async onOk() {
        try {
          const res = await JobService.deleteEquipmentsJob(id, idEquipment);
          if (res.success) {
            toast.success(t(['message:success']));
            fetchData();
          }
        } catch (error) {
          LogHelper.logError(error);
        }
      }
    });
  }, [fetchData, id, idEquipment, t]);
  return (
    <div className="mt-2 flex w-full gap-x-4">
      <div className="flex w-full items-center justify-between rounded-[4px] border border-[#000] bg-[#ccc] p-2">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={['fas', 'computer']} />
          {name}
        </div>
        <div className="mr-2">Quantity: {quantity}</div>
      </div>
      <CloseOutlined className="hover:font-red cursor-pointer" onClick={() => onDelete()} />
    </div>
  );
};

const IssueItem = ({
  data,
  jobId,
  idIssue,
  fetchData
}: {
  data: any;
  jobId: string;
  idIssue: string;
  fetchData: () => void;
}) => {
  const { t } = useTranslation(['message', 'button']);
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [listImage, setListImage] = useState<string[]>([]);

  const onDelete = useCallback(() => {
    ModalHelper.confirm({
      title: 'Are you sure delete this note?',
      async onOk() {
        try {
          if (!id) return;
          const res = await JobService.deleteIssue(id, idIssue);
          if (res.success) {
            toast.success(t(['message:success']));
            fetchData();
          }
        } catch (error) {
          LogHelper.logError(error);
        }
      }
    });
  }, [fetchData, id, idIssue, t]);
  const fetchDataImage = async () => {
    if (!data.id || !jobId) return;
    const res = await JobService.getListImageIssue(jobId, data.id);
    if (res.success) {
      setListImage(res.data.url_list);
    }
  };

  useEffect(() => {
    if (open) fetchDataImage();
  }, [open]);
  return (
    <>
      <div className="flex cursor-pointer gap-x-4">
        <div
          onClick={() => setOpen(true)}
          className="mt-2 flex w-full items-center gap-x-5 rounded-[4px] border border-[#000] bg-[#ccc] p-2"
        >
          <img className="rounded" src={images} width={50} height={50} style={{ pointerEvents: 'none' }} />
          <div className="flex flex-col gap-2">
            <div>{data.name}</div>
            <div>{data.date}</div>
          </div>
        </div>
        <CloseOutlined className="hover:font-red cursor-pointer" onClick={() => onDelete()} />
      </div>
      <Modal title="Note Detail" visible={open} onCancel={() => setOpen(false)} footer={null}>
        <Row gutter={[0, 0]}>
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

export default InformationaTab;
