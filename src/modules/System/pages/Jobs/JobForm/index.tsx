import { Col, DatePicker, Form, Input, Row, Spin, UploadFile, UploadProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as yup from 'yup';

import PathURL from '@/core/class/PathURL';
import { AppButton, AppDraggable, AppPageHeader, AppSelect, Box } from '@/core/components';
import { PRIORITIES } from '@/core/constants';
import { DateFormat, PriorityEnum, TemplateTypeEnum } from '@/core/enums';
import { useAppDispatch, useAppSelector, useForm } from '@/core/hooks';
import { CommonService, FileService, JobService, JobTemplateService } from '@/core/services';
import {
  Equipment,
  JobDetail1,
  JobPayload,
  Project,
  ResponseCommon,
  Sitelocation,
  TaskTemplate,
  Team
} from '@/core/types';
import { CommonHelper, DataHelper, FormatHelper } from '@/utils/helpers';
import { resetCommon, setNameMap } from '../../common.slice';
import { updateDocumentIdsDelete, updateDocumentList } from '../../TemplateForm/template-form.slice';
import { cloneDeep } from 'lodash';

const { TextArea } = Input;

type SearchInput = 'project' | 'team' | 'equipment' | 'sitelocation' | 'job';

type LoadingForm = {
  [key in SearchInput]: boolean;
};

type OptionForm = {
  project: Project[];
  team: Team[];
  equipment: Equipment[];
  sitelocation: Sitelocation[];
};

const schema = yup.object({
  name: yup.string().required(),
  scope_of_work: yup.string(),
  start_date: yup.mixed().required(),
  end_date: yup.mixed().required(),
  priority: yup.mixed<PriorityEnum>().oneOf(Object.values(PriorityEnum)).required(),
  type: yup.string(),
  project_id: yup.string().required(),
  team_id: yup.string().required(),
  site_location_id: yup.string().required(),
  equipment_ids: yup.array().of(yup.string().required()),
  description: yup.string(),
  documents: yup.array().of(yup.mixed<UploadFile>()),
  job_template_id: yup.string(),
  phone: yup
    .string()
    .label('Phone Number')
    .test({
      test: (value) => {
        if (!value) return true;
        return CommonHelper.isValidPhoneNumber(value);
      },
      message: 'Phone number is invalid'
    })
    .required(),
  contact: yup.string().required()
});

type JobForm = yup.InferType<typeof schema>;

const JobFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['message', 'button']);
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState<LoadingForm>({
    equipment: false,
    project: false,
    sitelocation: false,
    team: false,
    job: false
  });
  const [options, setOptions] = useState<OptionForm>({
    equipment: [],
    project: [],
    sitelocation: [],
    team: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);

  const {
    formField: { form, ...formProps }
  } = useForm<JobForm>({
    schema,
    async onSubmit(data) {
      if (!data) return;
      setSubmitting(true);
      const payload: JobPayload = {
        ...data,
        start_date: (data.start_date as Dayjs)?.format(DateFormat.YYYYMMDD),
        end_date: (data.end_date as Dayjs)?.format(DateFormat.YYYYMMDD),
        document_ids: []
      };
      try {
        const document_ids: string[] = [];
        if (data.documents?.length) {
          const formData = new FormData();
          data.documents.forEach((documents) => {
            formData.append('files', documents?.originFileObj as Blob);
          });
          const res = await FileService.uploadFile(formData);
          if (res.success && res.data) {
            document_ids.push(...FormatHelper.getFileIds(res.data));
          }
        }
        payload.document_ids = document_ids;
        // payload.job_template_id=
        let res: ResponseCommon<null> | null = null;

        if (id) {
          res = await JobService.updateJob(id, payload);
        } else {
          res = await JobService.addJob(payload);
        }
        if (res.success) {
          navigate(`/${PathURL.jobs}`);
          toast.success(t(['success']));
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  // reset common slice
  useEffect(() => {
    return () => {
      dispatch(resetCommon());
    };
  }, [dispatch]);

  const team_id = Form.useWatch('team_id', form);
  const project_id = Form.useWatch('project_id', form);
  const job_template_id = Form.useWatch('job_template_id', form);

  useEffect(() => {
    if (job_template_id) {
      const _taskTemplate = taskTemplates.find((item) => item.id === job_template_id);

      if (!_taskTemplate || id) return;

      form.setFieldsValue({
        priority: _taskTemplate.priority as PriorityEnum,
        type: _taskTemplate.type as TemplateTypeEnum,
        name: _taskTemplate.name as TemplateTypeEnum,
        scope_of_work: _taskTemplate.scope_of_work
      });
      dispatch(
        updateDocumentList(
          (_taskTemplate.documents || []).map((item: { name: string; id: string; download_url: string }) => ({
            name: item.name,
            uid: item.id,
            type: 'old',
            url: DataHelper.getUrlFile(item.download_url)
          })) ?? []
        )
      );
    } else {
      if (!id) form.resetFields(['type', 'priority']);
    }
  }, [form, taskTemplates, job_template_id, id, dispatch]);

  const setDataForm = useCallback(
    (data: JobDetail1) => {
      const {
        description,
        end_date,
        name,
        priority,
        scope_of_work,
        start_date,
        type,
        site_location,
        project,
        team,
        equipments,
        id
      } = data;

      form.setFieldsValue({
        description,
        name,
        priority,
        scope_of_work,
        type,
        start_date: dayjs(start_date) ?? '',
        end_date: dayjs(end_date) ?? '',
        project_id: project?.id,
        site_location_id: site_location?.id,
        team_id: team?.id,
        equipment_ids: equipments?.map((item) => item.id) ?? []
      });
      const options: OptionForm = {
        equipment: equipments ?? [],
        project: project ? [project] : [],
        sitelocation: site_location ? [site_location] : [],
        team: team ? [team] : []
      };
      setOptions(options);
      dispatch(setNameMap({ [id]: name }));
    },
    [form, dispatch]
  );

  // init select
  useEffect(() => {
    fetchOptions('', 'equipment');
    fetchOptions('', 'project');
    fetchOptions('', 'sitelocation');
    fetchOptions('', 'team');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchJobById = async () => {
      setLoading((preLoading) => ({ ...preLoading, job: true }));
      try {
        const res = await JobService.getJobById(id);
        const { success, data } = res;
        if (success && data) {
          setDataForm(data);
        }
      } finally {
        setLoading((preLoading) => ({ ...preLoading, job: false }));
      }
    };
    fetchJobById();
  }, [id, form, setDataForm]);

  const customer = useMemo(() => {
    if (!project_id) return '';
    const project = options.project.find((item) => item.id === project_id);
    return project?.customer_name ?? '';
  }, [options, project_id]);

  const pm = useMemo(() => {
    if (!team_id) return '';
    const team = options.team.find((item) => item.id === team_id);
    return team?.pm_name ?? '';
  }, [options, team_id]);

  const onBack = () => {
    navigate(-1);
  };

  const disableEndDate: any = useCallback(
    (date: Dayjs) => {
      const start_date = form.getFieldValue('start_date');
      return start_date && date.isBefore(start_date);
    },
    [form]
  );

  const disableStartDate: any = useCallback(
    (date?: Dayjs) => {
      const end_date = form.getFieldValue('end_date');
      return end_date && date?.isAfter(end_date);
    },
    [form]
  );
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const { documentList } = useAppSelector((state) => state.templateForm.template);

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    fileList: documentList,
    beforeUpload() {
      // const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
      // const isImage = validImageTypes.includes(file.type);
      // if (!isImage) {
      //   toast.error(`${file.name} is not a image file`);
      // }
      // return isImage || Upload.LIST_IGNORE;
      return true;
    },
    onChange(info) {
      dispatch(updateDocumentList(cloneDeep(info.fileList)));
      const { status } = info.file;
      if (status === 'done') {
        toast.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        toast.error(`${info.file.name} file upload failed.`);
      }
    },
    onRemove(file) {
      if (file.type === 'old') {
        dispatch(updateDocumentIdsDelete(file.uid));
      }
      dispatch(updateDocumentList(documentList.filter((item) => item.uid !== file.uid)));
    }
  };

  const fetchOptions = useCallback(async (value: string, searchInput: SearchInput) => {
    setLoading((preLoading) => ({ ...preLoading, [searchInput]: true }));
    try {
      type OptionType = Project | Equipment | Sitelocation | Team;
      let res: ResponseCommon<OptionType[]> | null = null;
      if (searchInput === 'project') {
        res = await CommonService.getProjects(value);
      } else if (searchInput === 'equipment') {
        res = await CommonService.getEquipments(value);
      } else if (searchInput === 'sitelocation') {
        res = await CommonService.getSitelocations(value);
      } else if (searchInput === 'team') {
        res = await CommonService.getTeams(value);
      }
      if (res?.success && res?.data) {
        const { data } = res;
        setOptions((preOptions) => ({
          ...preOptions,
          [searchInput]: data
        }));
      }
    } finally {
      setLoading((preLoading) => ({ ...preLoading, [searchInput]: false }));
    }
  }, []);

  const onSearch = (value: string, searchInput: SearchInput) => {
    CommonHelper.debounceFn(value, fetchOptions, searchInput);
  };

  const onCancel = () => {
    navigate(-1);
  };
  const fetchTaskTemplates = useCallback(async (value: string) => {
    const res = await JobTemplateService.getJobTemplateList(value as any);
    if (res.success) {
      setTaskTemplates(res.data ?? []);
    }
  }, []);
  useEffect(() => {
    fetchTaskTemplates('');
  }, [fetchTaskTemplates]);

  return (
    <div className="flex flex-col gap-y-2">
      <AppPageHeader onBack={onBack}>{id ? 'Update Job' : 'Create Job'}</AppPageHeader>
      <Spin spinning={loading.job}>
        <Box className="m-auto xl:max-w-5xl">
          <Form form={form} {...formProps} layout="vertical" disabled={submitting}>
            <Row gutter={[24, 0]}>
              {!id && (
                <Col md={24} sm={24} xs={24}>
                  <Form.Item name="job_template_id" label="Job template">
                    <AppSelect
                      placeholder="Select job template"
                      options={taskTemplates.map((item) => ({ label: item.name, value: item.id }))}
                      allowClear
                    />
                  </Form.Item>
                </Col>
              )}

              <Col md={12} sm={24} xs={24}>
                <Form.Item name="name" label="Job Name" required>
                  <Input placeholder="Job Name" disabled={!!job_template_id} />
                </Form.Item>
                <Form.Item name="start_date" label="Start Date" required>
                  <DatePicker className="w-full" format={DateFormat['MM/DD/YYYY']} disabledDate={disableStartDate} />
                </Form.Item>

                <Form.Item name="priority" label="Priority" required>
                  <AppSelect placeholder="Select priority" options={PRIORITIES} disabled={!!job_template_id} />
                </Form.Item>
                <Form.Item name="project_id" label="Project" required>
                  <AppSelect
                    placeholder="Select Project"
                    showSearch
                    filterOption={false}
                    onSearch={(value) => onSearch(value, 'project')}
                    options={options.project.map((item) => ({ label: item.name, value: item.id }))}
                    loading={loading.project}
                  />
                </Form.Item>
                <Form.Item name="team_id" label="Team" required>
                  <AppSelect
                    placeholder="Select Team"
                    showSearch
                    filterOption={false}
                    options={options.team.map((item) => ({ label: item.name, value: item.id }))}
                    loading={loading.team}
                    onSearch={(value) => onSearch(value, 'team')}
                  />
                </Form.Item>
                <Form.Item label="Phone" name="phone" required>
                  <Input placeholder="Phone" />
                </Form.Item>
                <Form.Item name="equipment_ids" label="Equipments" required>
                  <AppSelect
                    mode="multiple"
                    placeholder="Select equipment"
                    filterOption={false}
                    showSearch
                    loading={loading.equipment}
                    options={options.equipment.map((item) => ({ label: item.name, value: item.id }))}
                    onSearch={(value) => onSearch(value, 'equipment')}
                  />
                </Form.Item>
              </Col>
              <Col md={12} sm={24} xs={24}>
                <Form.Item name="scope_of_work" label="Scope">
                  <Input placeholder="Scope" disabled={!!job_template_id} />
                </Form.Item>
                <Form.Item name="end_date" label="End Date" required>
                  <DatePicker className="w-full" format={DateFormat['MM/DD/YYYY']} disabledDate={disableEndDate} />
                </Form.Item>
                <Form.Item name="type" label="Type">
                  <Input placeholder="Type" disabled={!!job_template_id} />
                </Form.Item>

                <Form.Item label="Customer" required>
                  <Input disabled placeholder="Customer" value={customer} />
                </Form.Item>
                <Form.Item label="Team Leader">
                  <Input placeholder="Team leader" disabled value={pm} />
                </Form.Item>

                <Form.Item label="Contact" name="contact" required>
                  <Input placeholder="Contact" />
                </Form.Item>
                <Form.Item name="site_location_id" label="Location" required>
                  <AppSelect
                    placeholder="Select Location"
                    showSearch
                    filterOption={false}
                    loading={loading.sitelocation}
                    options={options.sitelocation.map((item) => ({ label: item.name, value: item.id }))}
                    onSearch={(value) => onSearch(value, 'sitelocation')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Description">
              <TextArea placeholder="Description" />
            </Form.Item>
            {!id && !job_template_id && (
              <Form.Item
                label="Document"
                colon={true}
                wrapperCol={{ span: 24 }}
                labelAlign={'left'}
                name="documents"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                className="no-float-label"
              >
                <AppDraggable {...props} />
              </Form.Item>
            )}

            <Row gutter={[12, 6]} justify={'end'}>
              <Col>
                <AppButton disabled={submitting} onClick={onCancel}>
                  {t(['button:cancel'])}
                </AppButton>
              </Col>
              <Col>
                <AppButton type="primary" htmlType="submit" loading={submitting}>
                  {id ? t(['button:update']) : t(['button:add'])}
                </AppButton>
              </Col>
            </Row>
          </Form>
        </Box>
      </Spin>
    </div>
  );
};

export default JobFormPage;
