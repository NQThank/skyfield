import { UploadFile } from 'antd';

export type UploadFileResponse = {
  [key: string]: string;
}[];

export type UploadFileType = UploadFile & {
  fileType?: 'old' | 'new';
};
