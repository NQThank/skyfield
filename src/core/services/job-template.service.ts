import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import { IResponseList, PayloadJobTemplate, ResponseCommon, TaskTemplateFilter } from '../types';

class JobTemplateService extends BaseService {
  getJobTemplateList(params: TaskTemplateFilter): Promise<IResponseList<any[]>> {
    return this.get('', params);
  }

  getJobTemplateById(id: string): Promise<ResponseCommon<any>> {
    return this.get(`/${id}`);
  }

  addJobTemplate(payload: PayloadJobTemplate): Promise<ResponseCommon<null>> {
    return this.post('', payload);
  }

  updateJobTemplate(id: string, payload: PayloadJobTemplate): Promise<ResponseCommon<null>> {
    return this.put(`/${id}`, payload);
  }

  deleteJobTemplate(id: string): Promise<ResponseCommon<null>> {
    return this.delete(`/${id}`);
  }
}

export default new JobTemplateService(ApiURL.jobTemplate);
