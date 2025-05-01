import { AxiosRequestConfig } from 'axios';

import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import {
  AddSubTaskRes,
  ImageSubTaskItemPayload,
  IResponseList,
  JobImage,
  JobSubTaskTemplate,
  PayloadValue,
  ResponseCommon,
  SearchParamsValue,
  TJobTemplateItemSubTask
} from '../types';

class JobTaskService extends BaseService {
  getEquipmentsJob(jobId: string) {
    return this.get(`/${jobId}/equipments`);
  }
  updateTask(jobId: string, milestoneId: string, jobTaskId: string, payload: Record<string, any>) {
    return this.put(`/${jobId}/milestones/${milestoneId}/task/${jobTaskId}`, payload);
  }

  getItemsSubTask(
    jobId: string,
    milestoneId: string,
    jobTaskId: string,
    jobSubTaskId: string
  ): Promise<ResponseCommon<TJobTemplateItemSubTask[]>> {
    return this.get(`/${jobId}/milestones/${milestoneId}/tasks/${jobTaskId}/sub-tasks/${jobSubTaskId}/items`);
  }

  getGalleries(
    jobId: string,
    params?: SearchParamsValue,
    config?: AxiosRequestConfig
  ): Promise<IResponseList<JobImage[]>> {
    return this.get(`/${jobId}/gallery`, params, { ...config });
  }

  updateImagesTaskItem(jobId: string, taskItemId: string, payload: ImageSubTaskItemPayload) {
    return this.patch(`/${jobId}/item/${taskItemId}/gallery`, payload);
  }

  getImagesBySubTaskItem(jobId: string, subTaskItemId: string): Promise<IResponseList<JobImage[]>> {
    return this.get(`/${jobId}/item/${subTaskItemId}/gallery`, { page_number: 1, page_size: 1000 });
  }

  getDetailImageSubTaskItemById(
    jobId: string,
    subTaskItemId: string,
    imageId: string
  ): Promise<ResponseCommon<JobImage>> {
    return this.get(`/${jobId}/item/${subTaskItemId}/gallery/${imageId}`);
  }

  updateImageSubTaskItemById(jobId: string, subTaskItemId: string, imageId: string, payload: PayloadValue) {
    return this.post(`/${jobId}/item/${subTaskItemId}/gallery/${imageId}`, payload);
  }

  getSubTaskList(
    jobId: string,
    jobMilestoneId: string,
    jobTaskId: string
  ): Promise<ResponseCommon<JobSubTaskTemplate[]>> {
    return this.get(`/${jobId}/milestones/${jobMilestoneId}/tasks/${jobTaskId}/sub-tasks`);
  }

  addSubTask(
    jobId: string,
    jobMilestoneId: string,
    jobTaskId: string,
    payload: PayloadValue
  ): Promise<ResponseCommon<AddSubTaskRes>> {
    return this.post(`/${jobId}/milestones/${jobMilestoneId}/tasks/${jobTaskId}/sub-tasks`, payload);
  }

  updateSubTask(jobId: string, jobMilestoneId: string, jobTaskId: string, subTaskId: string, payload: PayloadValue) {
    return this.put(`/${jobId}/milestones/${jobMilestoneId}/tasks/${jobTaskId}/sub-tasks/${subTaskId}`, payload);
  }
  deleteSubTask(jobId: string, jobMilestoneId: string, jobTaskId: string, subTaskId: string) {
    return this.delete(`/${jobId}/milestones/${jobMilestoneId}/tasks/${jobTaskId}/sub-tasks/${subTaskId}`);
  }

  addSubTaskItemImage(
    jobId: string,
    jobMilestoneId: string,
    jobTaskId: string,
    subTaskId: string,
    payload: PayloadValue
  ): Promise<{ id: string }> {
    return this.post(`/${jobId}/milestones/${jobMilestoneId}/tasks/${jobTaskId}/sub-tasks/${subTaskId}/items`, payload);
  }

  updateSubTaskItemImage(
    jobId: string,
    jobMilestoneId: string,
    jobTaskId: string,
    subTaskId: string,
    subTaskItemId: string,
    payload: PayloadValue
  ) {
    return this.put(
      `/${jobId}/milestones/${jobMilestoneId}/tasks/${jobTaskId}/sub-tasks/${subTaskId}/items/${subTaskItemId}`,
      payload
    );
  }
  deleteSubTaskItemImage(
    jobId: string,
    jobMilestoneId: string,
    jobTaskId: string,
    subTaskId: string,
    subTaskItemId: string
  ) {
    return this.delete(
      `/${jobId}/milestones/${jobMilestoneId}/tasks/${jobTaskId}/sub-tasks/${subTaskId}/items/${subTaskItemId}`
    );
  }
}

export default new JobTaskService(ApiURL.job);
