import BaseService from '../class/BaseService';
import {
  Customer,
  Equipment,
  FormItem,
  Position,
  Project,
  ResponseCommon,
  Sector,
  Sitelocation,
  TaskTemplate,
  Team
} from '../types';

class CommonService extends BaseService {
  getFormItemTypes(): Promise<ResponseCommon<FormItem[]>> {
    return this.get('/form-item-types');
  }

  getPositions(): Promise<ResponseCommon<Position[]>> {
    return this.get('/positions');
  }
  getSectors(): Promise<ResponseCommon<Sector[]>> {
    return this.get('/sectors');
  }

  getTeams(key: string): Promise<ResponseCommon<Team[]>> {
    return this.get('/teams', { q: key });
  }

  getTaskTemplates(key: string): Promise<ResponseCommon<TaskTemplate[]>> {
    return this.get('/task-templates', { q: key });
  }

  getProjects(key: string): Promise<ResponseCommon<Project[]>> {
    return this.get('/projects', { q: key });
  }

  getEquipments(key: string): Promise<ResponseCommon<Equipment[]>> {
    return this.get('/equipments', { q: key });
  }

  getSitelocations(key: string): Promise<ResponseCommon<Sitelocation[]>> {
    return this.get('/site-locations', { q: key });
  }

  getCustomers(key: string): Promise<ResponseCommon<Customer[]>> {
    return this.get('/customers', { q: key });
  }

  getMarkets(key: string): Promise<ResponseCommon<Customer[]>> {
    return this.get('/markets', { q: key });
  }
}

export default new CommonService('');
