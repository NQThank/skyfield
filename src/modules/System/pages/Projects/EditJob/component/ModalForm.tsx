import { Col, DatePicker, Form, Input, Row, Spin, UploadFile, UploadProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { cloneDeep } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as yup from 'yup';

import { AppButton, AppDraggable, AppSelect } from '@/core/components';
import { PRIORITIES } from '@/core/constants';
import { DateFormat, PriorityEnum, TemplateTypeEnum } from '@/core/enums';
import { useAppDispatch, useAppSelector, useForm } from '@/core/hooks';
import {
  CommonService,
  FileService,
  JobService,
  JobTemplateService,
  SitelocationService,
  TeamService
} from '@/core/services';
import {
  Employee,
  Equipment,
  JobDetail1,
  JobPayload,
  Project,
  ResponseCommon,
  Sitelocation,
  TaskTemplate,
  Team
} from '@/core/types';
import { CommonHelper, DataHelper, FormatHelper, LogHelper } from '@/utils/helpers';
import { resetCommon } from '../../../common.slice';
import { updateDocumentIdsDelete, updateDocumentList } from '../../../TemplateForm/template-form.slice';
import jobService from '@/core/services/job.service';

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
  start_date: yup.mixed().nullable(),
  end_date: yup.mixed().nullable(),
  priority: yup.mixed<PriorityEnum>().oneOf(Object.values(PriorityEnum)).required(),
  type: yup.string().nullable(),
  team_id: yup.array().of(yup.string()).required(),
  site_location_id: yup.array().of(yup.string()).required(),
  equipment_ids: yup.array().of(yup.string().required()),
  description: yup.string().nullable(),
  documents: yup.array().of(yup.mixed<UploadFile>()),
  job_template_id: yup.string(),
  assignees: yup.array().of(yup.string()),
  market: yup.array().of(yup.string())
});

type JobForm = yup.InferType<typeof schema>;

const ModalForm = (modalProps: any) => {
  const { id, projectId } = useParams();
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
  const [data, setData] = useState({} as JobDetail1);
  const [submitting, setSubmitting] = useState(false);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [assignees, setAssignees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [locations, setLocations] = useState<Sitelocation[]>([]);
  function getUserChanges(current: string[], submit: string[]): { add_assignee: string[]; delete_assignee: string[] } {
    const add_assignee = submit.filter((id) => !current.includes(id));
    const delete_assignee = current.filter((id) => !submit.includes(id));

    return {
      add_assignee,
      delete_assignee
    };
  }
  function getTeamChanges(current: string[], submit: string[]): { add_team_id: string[]; delete_team_id: string[] } {
    const add_team_id = submit.filter((id) => !current.includes(id));
    const delete_team_id = current.filter((id) => !submit.includes(id));

    return {
      add_team_id,
      delete_team_id
    };
  }

  const {
    formField: { form, ...formProps }
  } = useForm<JobForm>({
    schema,
    async onSubmit(values) {
      if (!values) return;
      setSubmitting(true);
      const payload: JobPayload = {
        ...values,
        start_date: values?.start_date ? (values?.start_date as Dayjs)?.format(DateFormat.YYYYMMDD) : null,
        end_date: values?.end_date ? (values?.end_date as Dayjs)?.format(DateFormat.YYYYMMDD) : null,
        document_ids: [],
        project_id: projectId
      };
      try {
        const document_ids: string[] = [];
        if (values.documents?.length) {
          const formData = new FormData();
          values.documents.forEach((documents) => {
            formData.append('files', documents?.originFileObj as Blob);
          });
          const res = await FileService.uploadFile(formData);
          if (res.success && res.data) {
            document_ids.push(...FormatHelper.getFileIds(res.data));
          }
        }
        payload.document_ids = document_ids;
        let res: ResponseCommon<null> | null = null;
        if (id) {
          const resultAssignee = getUserChanges(
            data.assignees.map((Item) => Item.id),
            (values.assignees || []).filter((assignee): assignee is string => assignee !== undefined)
          );
          const resultTeam = getTeamChanges(
            data.team?.map((Item) => Item.id) ?? [],
            values.team_id.filter((id): id is string => id !== undefined)
          );
          payload.delete_team_id = resultTeam.delete_team_id;
          payload.add_team_id = resultTeam.add_team_id;
          payload.delete_assignee = resultAssignee.delete_assignee;
          payload.add_assignee = resultAssignee.add_assignee;
          res = await JobService.updateJob(id, payload);
        } else {
          payload.assign_user_ids = values.assignees?.filter((assignee): assignee is string => assignee !== undefined);
          // payload.add_team_id = values.team_id?.filter((team): team is string => team !== undefined);
          res = await JobService.addJob(payload);
        }
        if (res.success) {
          toast.success(t(['success']));
          modalProps.onCancel();
          modalProps.fetchData();
        }
      } finally {
        setSubmitting(false);
        if (!id) form.resetFields();
      }
    }
  });

  // reset common slice
  useEffect(() => {
    return () => {
      dispatch(resetCommon());
    };
  }, [dispatch]);

  const job_template_id = Form.useWatch('job_template_id', form);

  useEffect(() => {
    if (job_template_id) {
      const _taskTemplate = taskTemplates.find((item) => item.id === job_template_id);

      if (!_taskTemplate || id) return;

      form.setFieldsValue({
        priority: _taskTemplate.priority as PriorityEnum,
        type: _taskTemplate.type as TemplateTypeEnum,
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
      const { description, end_date, name, priority, start_date, type, site_location, team, equipments } = data;
      form.setFieldsValue({
        description,
        name,
        priority,
        type,
        start_date: start_date ? dayjs(start_date) : '',
        end_date: end_date ? dayjs(end_date) : '',
        site_location_id: site_location?.map((item) => item.id) ?? [],
        team_id: team?.map((item) => item.id),
        equipment_ids: equipments?.map((item) => item.id) ?? [],
        assignees: data.assignees.map((item) => item.id)
      });

      // const options: OptionForm = {
      //   equipment: equipments ?? [],
      //   project: project ? [project] : [],
      //   sitelocation: site_location ? [site_location] : [],
      //   team: team ? [team] : []
      // };
      // setOptions(options);
    },
    [form, setOptions, assignees]
  );

  // init select
  useEffect(() => {
    fetchOptions('', 'equipment');
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
          fetchAssignees(data.team?.map((item) => item.id) ?? []);
          setDataForm(data);
          setData(data);
          modalProps.fetchData();
        }
      } finally {
        setLoading((preLoading) => ({ ...preLoading, job: false }));
      }
    };
    fetchJobById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, form]);

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

  const fetchOptions = useCallback(
    async (value: string, searchInput: SearchInput) => {
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
    },
    [setOptions]
  );

  const onSearch = (value: string, searchInput: SearchInput) => {
    CommonHelper.debounceFn(value, fetchOptions, searchInput);
  };

  const fetchTaskTemplates = useCallback(async (value: string) => {
    const res = await JobTemplateService.getJobTemplateList(value as any);
    if (res.success) {
      setTaskTemplates(res.data ?? []);
    }
  }, []);

  const fetchAssignees = useCallback(
    async (teamId: string[]) => {
      try {
        const { success, data: listUser } = await jobService.getAssigneeByTeamId({
          job_id: id || '',
          team_ids: teamId
        });
        if (success && listUser) {
          setAssignees(listUser);
          // setAssignees([...listUser, ...(data?.assignees ?? [])]);
        }
      } catch (error) {
        LogHelper.logError(error);
      }
    },
    [id, data]
  );
  const fetchTeam = async () => {
    try {
      const resTeam = await TeamService.getTeamList({ page_number: 1, page_size: 100 });
      const resLocation = await SitelocationService.getSitelocationList({ page_number: 1, page_size: 100 });
      if (resTeam.success && resLocation.success) {
        setTeams(resTeam.data || []);
        setLocations(resLocation.data || []);
      }
    } catch (error) {
      LogHelper.logError(error);
    }
  };
  useEffect(() => {
    fetchTeam();
  }, []);

  useEffect(() => {
    if (!id) fetchTaskTemplates('');
  }, [fetchTaskTemplates, id]);

  const onValuesChange = (changedValues: any) => {
    if (changedValues.team_id) {
      fetchAssignees(changedValues.team_id);
      form.setFieldsValue({ assignees: [] });
    }
  };
  return (
    <div className="flex flex-col gap-y-2">
      <Spin spinning={loading.job}>
        <Form form={form} {...formProps} layout="vertical" disabled={submitting} onValuesChange={onValuesChange}>
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
            <Col md={24} sm={24} xs={24}>
              <Form.Item name="name" label="Job Name" required>
                <Input placeholder="Job Name" />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item name="start_date" label="Start Date">
                <DatePicker className="w-full" format={DateFormat['MM/DD/YYYY']} disabledDate={disableStartDate} />
              </Form.Item>

              <Form.Item name="priority" label="Priority" required>
                <AppSelect placeholder="Select priority" options={PRIORITIES} disabled={!!job_template_id} />
              </Form.Item>
              <Form.Item name="team_id" label="Team" required>
                <AppSelect
                  placeholder="Select Team"
                  showSearch
                  mode="multiple"
                  filterOption={false}
                  options={teams.map((item) => ({ label: item.name, value: item.id }))}
                  loading={loading.team}
                  onSearch={(value) => onSearch(value, 'team')}
                />
              </Form.Item>
              <Form.Item name="market" label="Market" required>
                <AppSelect
                  placeholder="Select Market"
                  options={taskTemplates.map((item) => ({ label: item.name, value: item.id }))}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col md={12} sm={24} xs={24}>
              <Form.Item name="type" label="Type">
                <Input placeholder="Type" disabled={!!job_template_id} />
              </Form.Item>
              <Form.Item name="end_date" label="End Date">
                <DatePicker className="w-full" format={DateFormat['MM/DD/YYYY']} disabledDate={disableEndDate} />
              </Form.Item>
              <Form.Item name="site_location_id" label="Location" required>
                <AppSelect
                  placeholder="Select Location"
                  showSearch
                  filterOption={false}
                  mode="multiple"
                  loading={loading.sitelocation}
                  options={locations.map((item) => ({ label: item.name, value: item.id }))}
                  onSearch={(value) => onSearch(value, 'sitelocation')}
                />
              </Form.Item>
              <Form.Item label="User" name="assignees">
                <AppSelect
                  placeholder="Select User"
                  showSearch
                  filterOption={false}
                  mode="multiple"
                  options={assignees.map((item) => ({ label: item.full_name, value: item.id }))}
                  loading={loading.project}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea placeholder="Description" autoSize={{ minRows: 3, maxRows: 5 }} />
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
              <AppButton disabled={submitting} onClick={modalProps.onCancel}>
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
      </Spin>
    </div>
  );
};

export default ModalForm;
