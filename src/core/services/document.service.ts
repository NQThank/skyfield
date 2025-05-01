import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import { ResponseCommon } from '../types';

class DocumentService extends BaseService {
  deleteDocument(id: string): Promise<ResponseCommon<any>> {
    return this.delete(`/${id}`);
  }
}

export default new DocumentService(ApiURL.document);
