import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PathEnum } from '@/core/enums';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { CommonService, FileService, JobTemplateService } from '@/core/services';
import { PayloadJobTemplate, ResponseCommon, TaskTemplate } from '@/core/types';
import { setGeneralInfo, toggleLoading, updateDocumentList } from '../TemplateForm/template-form.slice';
import { DataHelper, FormatHelper } from '@/utils/helpers';
import TemplateJobForm from '../TemplateForm/TemplateJobForm';
import { setNameMap } from '../common.slice';

type TaskTemplateFormPageProps = {};
type JobTaskMileStone = {
  task_id?: string;
  task_template_id?: string;
  location_type?: string;
  type?: string;
  priority?: string;
  name?: string;
  id?: string;
};
export type MileStoneType = {
  id: string;
  name: string;
  job_tasks: JobTaskMileStone[];
};

const JobTemplateFormPage: React.FC<TaskTemplateFormPageProps> = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [milestone, setMilestone] = useState<MileStoneType[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const { t } = useTranslation(['message']);

  const dispatch = useAppDispatch();
  const {
    template: { documentList, delete_document_ids }
  } = useAppSelector((root) => root.templateForm);

  useEffect(() => {
    if (!id) return;
    const fetchTaskTemplateById = async () => {
      dispatch(toggleLoading('loadingData'));
      try {
        const { success, data } = await JobTemplateService.getJobTemplateById(id);
        if (success && data) {
          const { scope_of_work, description, name, priority, type, documents } = data;
          dispatch(setGeneralInfo({ description, name, priority, type, scope_of_work }));
          dispatch(
            updateDocumentList(
              documents?.map((item: { name: string; id: string; download_url: string }) => ({
                name: item.name,
                uid: item.id,
                type: 'old',
                url: DataHelper.getUrlFile(item.download_url)
              })) ?? []
            )
          );
          dispatch(setNameMap({ [id]: name ?? '' }));

          setMilestone(data.job_milestone_templates);
        }
      } finally {
        dispatch(toggleLoading('loadingData'));
      }
    };
    fetchTaskTemplateById();
  }, [id, dispatch]);

  const fetchTaskTemplates = useCallback(async (value: string) => {
    const res = await CommonService.getTaskTemplates(value);
    if (res.success) {
      setTaskTemplates(res.data ?? []);
    }
  }, []);
  useEffect(() => {
    fetchTaskTemplates('');
  }, [fetchTaskTemplates]);
  useEffect(() => {
    if (milestone?.length && taskTemplates?.length) {
      const result = milestone.map((mile: MileStoneType) => {
        return {
          ...mile,
          job_tasks: (mile?.job_tasks || []).map((e: JobTaskMileStone) => {
            const filter = taskTemplates.find((f) => f.id === e.task_id);
            return { ...filter, task_template_id: filter?.id };
          })
        };
      });
      setMilestone(result as MileStoneType[]);
    }
  }, [taskTemplates, setMilestone]);

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const payload: PayloadJobTemplate = {
        ...values,
        delete_document_ids,
        job_milestone_templates: milestone?.length
          ? milestone.map((e: MileStoneType, index) => ({
              name: e.name,
              order_value: index,
              task_template_ids: e?.job_tasks?.length
                ? e.job_tasks.map((i: JobTaskMileStone) => i.task_template_id)
                : []
            }))
          : []
      };
      const add_document_ids: string[] = [];
      const documentsAdd = documentList.filter((item) => item.type !== 'old');
      if (documentsAdd.length) {
        const formData = new FormData();
        documentsAdd.forEach((document) => {
          formData.append('files', document?.originFileObj as Blob);
        });
        const res = await FileService.uploadFile(formData);
        if (res.success && res.data) {
          add_document_ids.push(...FormatHelper.getFileIds(res.data));
        }
      }
      payload.add_document_ids = add_document_ids;
      let res: ResponseCommon<null> | null = null;
      if (id) {
        res = await JobTemplateService.updateJobTemplate(id, payload);
      } else {
        res = await JobTemplateService.addJobTemplate(payload);
      }
      if (res.success) {
        navigate(`/${PathEnum['job-templates']}`);
        toast.success(t(['message:success']));
      }
    } finally {
      setSubmitting(false);
    }
  };
  return <TemplateJobForm onSubmit={onSubmit} submitting={submitting} list={{ milestone, setMilestone }} />;
};

export default React.memo(JobTemplateFormPage);
