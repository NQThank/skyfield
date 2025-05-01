import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import { IResponseList, ResponseCommon, TaskTemplate, TaskTemplateFilter, TaskTemplatePayload } from '../types';

class TaskTemplateService extends BaseService {
  getTaskTemplateList(params: TaskTemplateFilter): Promise<IResponseList<TaskTemplate[]>> {
    return this.get('', params);
  }

  getTaskTemplateById(id: string): Promise<ResponseCommon<TaskTemplate>> {
    return this.get(`/${id}`);
  }

  addTaskTemplate(payload: TaskTemplatePayload): Promise<ResponseCommon<null>> {
    return this.post('', payload);
  }

  updateTaskTemplate(id: string, payload: TaskTemplatePayload): Promise<ResponseCommon<null>> {
    return this.put(`/${id}`, payload);
  }

  deleteTaskTemplate(id: string): Promise<ResponseCommon<null>> {
    return this.delete(`/${id}`);
  }
}

export default new TaskTemplateService(ApiURL.taskTemplate);
