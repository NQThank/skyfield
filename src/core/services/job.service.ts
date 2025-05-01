import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import {
  Equipment,
  EquipmentJobPayload,
  IResponseList,
  Job,
  JobDetail1,
  JobFilter,
  JobMilestone,
  JobMilestonePayload,
  JobPayload,
  JobTaskResponse,
  JobTaskStatus,
  JobTaskTemplatePayload,
  ResponseCommon,
  TaskMilestonePayload,
  TComment,
  Team,
  TeamJobPayload,
  UpdateDocumentPayload
} from '../types';

class JobService extends BaseService {
  getJobList = (params: JobFilter): Promise<IResponseList<Job[]>> => {
    return this.get('', params);
  };

  getJobById(id: string): Promise<ResponseCommon<JobDetail1>> {
    return this.get(`/${id}`);
  }

  addJob(payload: JobPayload): Promise<ResponseCommon<null>> {
    return this.post('', payload);
  }

  updateJob(id: string, payload: JobPayload): Promise<ResponseCommon<null>> {
    return this.put(`/${id}`, payload);
  }

  deleteJob(id: string): Promise<ResponseCommon<null>> {
    return this.delete(`/${id}`);
  }

  updateStatusJob(id: string, status: JobTaskStatus): Promise<ResponseCommon<null>> {
    return this.patch(`/${id}/status`, { status });
  }
  // ==== Milestone ====
  getMilestonesByJobId(jobId: string): Promise<ResponseCommon<JobMilestone[]>> {
    return this.get(`/${jobId}/milestones`);
  }

  addMilestone(jobId: string, payload: JobMilestonePayload): Promise<ResponseCommon<null>> {
    return this.post(`/${jobId}/milestones`, payload);
  }

  updateMilestone(jobId: string, id: string, payload: JobMilestonePayload): Promise<ResponseCommon<null>> {
    return this.put(`/${jobId}/milestones/${id}`, payload);
  }

  updateOrderMilestone(jobId: string, id: string, order_value: number): Promise<ResponseCommon<null>> {
    return this.patch(`/${jobId}/milestones/${id}/order`, { order_value });
  }

  deleteMilestone(jobId: string, id: string): Promise<ResponseCommon<null>> {
    return this.delete(`/${jobId}/milestones/${id}`);
  }

  // ==== End Milestone ====

  // ==== Team ====

  getTeamByJobId(jobId: string): Promise<ResponseCommon<Team>> {
    return this.get(`/${jobId}/team`);
  }

  updateTeamJob(jobId: string, payload: TeamJobPayload): Promise<ResponseCommon<null>> {
    return this.put(`/${jobId}/team`, payload);
  }
  // ==== End Team ====

  // ==== Equipment ====
  getEquipmentsByJobId(jobId: string): Promise<ResponseCommon<Equipment[]>> {
    return this.get(`/${jobId}/equipments`);
  }

  updateEquipmentsJob(jobId: string, payload: EquipmentJobPayload): Promise<ResponseCommon<null>> {
    return this.put(`/${jobId}/equipments`, payload);
  }

  deleteEquipmentsJob(jobId: string, equipmentId: string): Promise<ResponseCommon<null>> {
    return this.delete(`/${jobId}/equipments/${equipmentId}`);
  }
  // ==== End Equipment ====

  // ==== Task ====
  addTask(jobId: string, milestoneId: string, payload: TaskMilestonePayload): Promise<ResponseCommon<null>> {
    return this.post(`/${jobId}/milestones/${milestoneId}/task`, payload);
  }

  getTaskById(jobId: string, milestoneId: string, id: string): Promise<ResponseCommon<JobTaskResponse>> {
    return this.get(`/${jobId}/milestones/${milestoneId}/task/${id}`);
  }

  updateTask(
    jobId: string,
    milestoneId: string,
    id: string,
    payload: JobTaskTemplatePayload
  ): Promise<ResponseCommon<null>> {
    return this.put(`/${jobId}/milestones/${milestoneId}/task/${id}`, payload);
  }
  // ==== End Task ====

  // Document
  getDocumentsByJobId(jobId: string): Promise<ResponseCommon<Record<string, string>>> {
    return this.get(`/${jobId}/document`);
  }

  updateDocument(jobId: string, payload: UpdateDocumentPayload): Promise<ResponseCommon<null>> {
    return this.patch(`/${jobId}/document`, payload);
  }

  deleteDocument(jobId: string, id: string) {
    return this.delete(`/${jobId}/document/${id}`);
  }
  // ==== Document ====
  getCheckinCheckout(id: string, params: any) {
    return this.get(`/${id}/check-in-out`, params);
  }

  // ==== gallery ====
  getGalleryById(id: string, payload: { page_number: number; page_size: number }) {
    return this.get(`/${id}/gallery`, payload);
  }
  updateGalleryById(id: string, idImage: string) {
    return this.patch(`/${id}/gallery`, {
      add_gallery_ids: [idImage]
    });
  }

  // ==== gallery ====

  // ==== issues ====
  getIssuesById(id: string) {
    return this.get(`/${id}/issues`);
  }
  createIssueById(id: string, payload: any) {
    return this.post(`/${id}/issues`, payload);
  }
  deleteIssue(idJob: string, idIssues: string) {
    return this.delete(`/${idJob}/issues/${idIssues}`);
  }

  deleteTaskMilestone(id: string, milestoneId: string, taskId: string) {
    return this.delete(`/${id}/milestones/${milestoneId}/task/${taskId}`);
  }

  getListImageIssue(id: string, issueId: string) {
    return this.get(`/${id}/issues/${issueId}`);
  }

  // assignees
  getAssigneeByTeamId(params: { job_id: string; team_ids: string[] }): Promise<ResponseCommon<any>> {
    return this.post(`/team/available-assign-list`, params);
  }
  getJobByIdAssignee(id: string): Promise<ResponseCommon<any>> {
    return this.get(`/${id}/assigners-list`);
  }
  updateAssigneeForJob(id: string, payload: any): Promise<ResponseCommon<any>> {
    return this.post(`/${id}/assign`, payload);
  }

  getCommentTask(id: string, itemId: string, galleryId: string): Promise<ResponseCommon<TComment[]>> {
    return this.get(`/${id}/item/${itemId}/gallery/${galleryId}/comments`);
  }

  // equipment task
  getEquipmentTask(id: string, milestoneId: string, taskId: string, subTaskId: string): Promise<ResponseCommon<any[]>> {
    return this.get(`/${id}/milestones/${milestoneId}/tasks/${taskId}/sub-tasks/${subTaskId}/equipments`);
  }

  updateEquipmentTask(id: string, milestoneId: string, taskId: string, subTaskId: string, payload: any) {
    return this.put(`/${id}/milestones/${milestoneId}/tasks/${taskId}/sub-tasks/${subTaskId}`, payload);
  }
}

export default new JobService(ApiURL.job);
