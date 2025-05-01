import { AxiosRequestConfig } from 'axios';

import ApiURL from '../class/ApiURL';
import BaseService from '../class/BaseService';
import { ResponseCommon, UploadFileResponse } from '../types';

class FileService extends BaseService {
  uploadFile(payload: FormData, config?: AxiosRequestConfig): Promise<ResponseCommon<UploadFileResponse>> {
    return this.post(
      '/temps',
      payload,
      config ?? {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  }
}

export default new FileService(ApiURL.file);
