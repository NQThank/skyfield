import axios, { AxiosInstance } from 'axios';
import Qs from 'qs';

import { CommonHelper, StorageHelper } from '@/utils/helpers';

const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Access-Control-Allow-Origin': '*' },
  paramsSerializer: {
    serialize: function (params) {
      return Qs.stringify(params, { arrayFormat: 'comma' });
    }
  }
});

axiosClient.interceptors.request.use(
  async function (config) {
    const sessionUser: any = StorageHelper.get('sessionUser');
    if (sessionUser) {
      config.headers.set('Authorization', `Bearer ${sessionUser?.stsTokenManager?.accessToken}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  async function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if ('success' in response.data && !response.data?.success) {
      return Promise.reject(response.data);
    }
    if (response && response.status) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    // if (error?.response?.status === 401) {
    //   localStorage.removeItem('sessionUser');
    //   window.location.href = '/login';
    // }
    // Handle refresh token

    CommonHelper.handleError(error);
    return Promise.reject(error);
  }
);
export default axiosClient;
