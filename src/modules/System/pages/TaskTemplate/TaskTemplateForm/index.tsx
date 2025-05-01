import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import PathURL from '@/core/class/PathURL';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { FileService, TaskTemplateService } from '@/core/services';
import { GeneralInfoForm, ResponseCommon } from '@/core/types';
import { DataHelper, FormatHelper } from '@/utils/helpers';
import TemplateForm from '../../TemplateForm';
import {
  setGeneralInfo,
  setTaskTemplate,
  toggleLoading,
  updateDocumentList
} from '../../TemplateForm/template-form.slice';
import { setNameMap } from '../../common.slice';
import { useJobTask } from '@/store';

type TaskTemplateFormPageProps = {};

const TaskTemplateFormPage: React.FC<TaskTemplateFormPageProps> = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [currentSubtaskTemplate, setCurrentSubtaskTemplate] = useState<any>();

  const { t } = useTranslation(['message']);

  const dispatch = useAppDispatch();
  const {
    template: { documentList, delete_document_ids }
  } = useAppSelector((root) => root.templateForm);
  const { jobSubTasks, jobTemplateItemsSubTaskMap, setJobSubTasks, setTemplateItemSubTask } = useJobTask();

  const handleUpdateTemplateItemsSubTask = useCallback((subtask: any) => {
    setJobSubTasks(subtask);
    const obj = subtask.reduce((acc: { [key: string]: any }, item: any) => {
      acc[item.id] = item.task_item_templates;
      return acc;
    }, {});
    setTemplateItemSubTask(obj);
  }, []);

  const handlePayloadSubTask = useCallback((oldSubtask: any, newSubtask: any) => {
    const result: any[] = [];
    newSubtask.forEach((element: any) => {
      if (!(oldSubtask || []).map((i: any) => i.id).includes(element.id)) {
        result.push({
          name: element.name,
          item_required: element.item_required || false,
          approve_required: element.approve_required || false,
          marked: element.marked || false,
          job_task_items: element.job_task_items.map((x: { name: string }) => ({ name: x.name }))
        });
      } else {
        const oldElement = oldSubtask.find((i: any) => i.id === element.id);
        const task_item_templates_result: any[] = [];
        element.job_task_items.forEach((j: any) => {
          if (!oldElement?.task_item_templates?.map((k: any) => k.id).includes(j.id)) {
            task_item_templates_result.push({ name: j.name });
          } else {
            const oldItem = oldElement?.task_item_templates?.find((z: any) => z.id === j.id);
            if (j.name !== oldItem.name) {
              task_item_templates_result.push({ id: j.id, name: j.name });
            }
          }
        });
        if (element.name !== oldElement.name) {
          result.push({ id: element.id, name: element.name, job_task_items: task_item_templates_result });
        } else {
          result.push({ id: element.id, name: element.name, job_task_items: task_item_templates_result });
        }
      }
    });
    return result;
  }, []);
  useEffect(() => {
    if (!id) {
      setJobSubTasks([]);
      setTemplateItemSubTask({});
      return;
    }
    const fetchTaskTemplateById = async () => {
      dispatch(toggleLoading('loadingData'));
      try {
        const { success, data } = await TaskTemplateService.getTaskTemplateById(id);
        if (success && data) {
          const { sub_task_templates, location_type, name, number_of_men, total_working_hour, documents } = data;
          dispatch(setTaskTemplate({ from: 'task-template', data: sub_task_templates }));
          dispatch(setGeneralInfo({ location_type, name, number_of_men, total_working_hour, sector_required: true }));
          dispatch(setNameMap({ [id]: name ?? '' }));
          dispatch(
            updateDocumentList(
              documents?.map((item) => ({
                name: item.name,
                uid: item.id,
                type: 'old',
                url: DataHelper.getUrlFile(item.download_url)
              })) ?? []
            )
          );
          handleUpdateTemplateItemsSubTask(data.sub_task_templates);
          setCurrentSubtaskTemplate(data.sub_task_templates);
        }
      } finally {
        dispatch(toggleLoading('loadingData'));
      }
    };
    fetchTaskTemplateById();
  }, [id, dispatch]);

  function findUniqueElements(oldArray: string[], newArray: string[]) {
    const set2 = new Set(newArray);
    const uniqueElements = oldArray.filter((element) => !set2.has(element));
    return uniqueElements;
  }
  function extractNewJobTaskItemIds(data: any[]) {
    const ids: any[] = [];
    data.forEach((item: { job_task_items: any[] }) => {
      item?.job_task_items?.forEach((jobTaskItem: { id: any }) => {
        ids.push(jobTaskItem.id);
      });
    });

    return ids;
  }
  function extractOldJobTaskItemIds(data: any[]) {
    const ids: any[] = [];
    data?.forEach((item: { task_item_templates: any[] }) => {
      item?.task_item_templates?.forEach((jobTaskItem: { id: any }) => {
        ids.push(jobTaskItem.id);
      });
    });

    return ids;
  }
  const onSubmit = async (values: GeneralInfoForm) => {
    setSubmitting(true);
    try {
      const payload: any = {
        ...values,
        number_of_men: Number(values.number_of_men),
        total_working_hour: Number(values.total_working_hour),
        delete_document_ids,
        add_document_ids: []
      };
      payload.data = jobSubTasks.map((item) => ({
        ...item,
        job_task_items: jobTemplateItemsSubTaskMap[item.id] ?? []
      }));

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

      payload.delete_sub_tasks = findUniqueElements(
        (currentSubtaskTemplate || []).map((i: any) => i.id),
        payload.data.map((i: any) => i.id)
      );
      payload.delete_items = findUniqueElements(
        extractOldJobTaskItemIds(currentSubtaskTemplate),
        extractNewJobTaskItemIds(payload.data)
      );

      payload.data = handlePayloadSubTask(currentSubtaskTemplate, payload.data);
      // console.log('payload', payload);
      // return;
      if (id) {
        res = await TaskTemplateService.updateTaskTemplate(id, payload);
      } else {
        res = await TaskTemplateService.addTaskTemplate(payload);
      }
      if (res.success) {
        navigate(`/${PathURL.taskTemplates}`);
        toast.success(t(['message:success']));
      }
    } finally {
      setSubmitting(false);
    }
  };
  return <TemplateForm onSubmit={onSubmit} submitting={submitting} />;
};

export default TaskTemplateFormPage;
