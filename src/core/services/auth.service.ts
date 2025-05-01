import { LoginPayload, ResponseCommon, SessionUser } from '@/core/types';
import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import { CURRENT_ENV } from '../configs/env';

class AuthService extends BaseService {
  login(payload: LoginPayload): Promise<ResponseCommon<SessionUser>> {
    return this.post('/login', payload, { baseURL: CURRENT_ENV.API_URL }, false);
  }
}

export default new AuthService(ApiURL.auth);
