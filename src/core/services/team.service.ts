import { AxiosRequestConfig } from 'axios';

import {
  EmployeePM,
  IResponseList,
  ResponseCommon,
  ResponseCommonOld,
  Team,
  TeamFilter,
  TeamPayload
} from '@/core/types';
import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';

class TeamService extends BaseService {
  getAllTeam(config?: AxiosRequestConfig): Promise<ResponseCommonOld<Team[]>> {
    return this.get(`/all`, {}, config);
  }

  getTeamList(params: TeamFilter, config?: AxiosRequestConfig): Promise<IResponseList<Team[]>> {
    return this.get('', params, config);
  }

  getPmsList(params: { q?: string }): Promise<ResponseCommon<EmployeePM[]>> {
    return this.get('/get-pms', params);
  }

  addTeam(payload: TeamPayload): Promise<ResponseCommon<null>> {
    return this.post(``, payload);
  }

  updateTeam(id: string, payload: TeamPayload): Promise<ResponseCommon<null>> {
    return this.put(`/${id}`, payload);
  }

  deleteTeam(id: string): Promise<ResponseCommon<null>> {
    return this.delete(`/${id}`);
  }
}

export default new TeamService(ApiURL.team);
