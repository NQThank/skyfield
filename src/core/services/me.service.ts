import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import { Employee, ProfilePayload, ResponseCommon } from '../types';

class MeService extends BaseService {
  getProfile(): Promise<ResponseCommon<Employee>> {
    return this.get('/profile');
  }
  updateProfile(payload: ProfilePayload): Promise<ResponseCommon<null>> {
    return this.put('/profile', payload);
  }

  updateAvatar(payload: FormData) {
    return this.patch(`/profile/avatar`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  changePassword(payload: Record<string, string>): Promise<ResponseCommon<null>> {
    return this.post('/password/change', payload);
  }
}

export default new MeService(ApiURL.me);
