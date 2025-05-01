import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import { Position, ResponseCommonOld, Sector } from '../types';

class TemplateMasterDataService extends BaseService {
  getSectorPositions(): Promise<ResponseCommonOld<{ positions: Position[]; sectors: Sector[] }>> {
    return this.get('');
  }
}

export default new TemplateMasterDataService(ApiURL.taskTemplateMasterData);
