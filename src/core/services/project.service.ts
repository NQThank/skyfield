import { AxiosRequestConfig } from 'axios';

import { IResponseList, Project, ProjectFilter, ResponseCommon, ResponseCommonOld } from '@/core/types';
import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';

class ProjectService extends BaseService {
  getAllProject(config?: AxiosRequestConfig): Promise<ResponseCommonOld<Project[]>> {
    return this.get(`/all`, {}, config);
  }

  getProjectList(params: ProjectFilter, config?: AxiosRequestConfig): Promise<IResponseList<Project[]>> {
    return this.get('', params, config);
  }

  deleteProject(id: string): Promise<ResponseCommon<null>> {
    return this.delete(`/${id}`);
  }

  addProject(payload: Record<string, string | number | null>): Promise<ResponseCommon<any>> {
    return this.post(``, payload);
  }

  updateProject(id: string, payload: Record<string, string | number | null>) {
    return this.put(`/${id}`, payload);
  }

  getProjectById(id: string) {
    return this.get(`/${id}`);
  }
}

export default new ProjectService(ApiURL.project);
