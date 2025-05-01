import { Card, UploadProps } from 'antd';
import { AxiosProgressEvent, AxiosRequestConfig } from 'axios';
import _ from 'lodash';
import React, { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { FileService, JobTaskService } from '@/core/services';
import { UploadFileType } from '@/core/types';
import { FormatHelper } from '@/utils/helpers';
import AppDraggable from '../../base/AppDraggable';

type TaskDocumentsProps = UploadProps & {
  fileList?: UploadFileType[];
  setFileRemoved: React.Dispatch<React.SetStateAction<UploadFileType[]>>;
  ref?: React.Ref<any>;
};

const TaskDocuments: React.FC<TaskDocumentsProps> = React.forwardRef(
  ({ fileList = [], setFileRemoved, ...props }, ref) => {
    console.log('🚀 ~ fileList:', fileList);
    const { jobId, milestoneId, id } = useParams();
    const [fileListLocal, setFileListLocal] = useState<UploadFileType[]>(fileList);
    console.log('🚀 ~ fileListLocal:', fileListLocal);

    useEffect(() => {
      setFileListLocal(fileList);
    }, [fileList]);

    const localProps: UploadProps = {
      name: 'file',
      multiple: true,
      fileList: fileListLocal,
      customRequest(options) {
        (async () => {
          const { onSuccess, file, onProgress } = options;

          const formData = new FormData();
          const config: AxiosRequestConfig = {
            headers: { 'content-type': 'multipart/form-data' },
            onUploadProgress: (event: AxiosProgressEvent) => {
              event?.total && onProgress?.({ percent: (event.loaded / event.total) * 100 });
            }
          };
          formData.append('files', file);
          try {
            const { success, data } = await FileService.uploadFile(formData, config);
            if (success && data) {
              if (!jobId || !milestoneId || !id) return;
              await JobTaskService.updateTask(jobId, milestoneId, id, {
                add_document_ids: [FormatHelper.getFileIds(data)?.[0]]
              });
              onSuccess?.(FormatHelper.getFileIds(data)?.[0]);
            }
          } catch (err) {
            console.log('Error: ', err);
          }
        })();
      },
      onChange({ file, fileList }) {
        setFileListLocal(fileList);
        const { status } = file;
        if (status === 'done') {
          toast.success(`${file.name} file uploaded successfully.`);
        } else if (status === 'error') {
          toast.error(`${file.name} file upload failed.`);
        }
      },
      async onRemove(file: UploadFileType) {
        const _files = _.cloneDeep(fileListLocal);
        const indexFindRemove = _files.findIndex((item) => item.uid === file.uid);
        if (indexFindRemove !== -1) {
          _files[indexFindRemove].status = 'removed';
          setFileListLocal(_files);
          if (!jobId || !milestoneId || !id) return;
          await JobTaskService.updateTask(jobId, milestoneId, id, {
            delete_document_ids: [file.fileType === 'old' ? file.uid : file.response]
          });
        }
      }
    };
    return (
      <Card title="Document">
        <AppDraggable {...props} {...localProps} ref={ref} />
      </Card>
    );
  }
);

TaskDocuments.displayName = 'TaskDocuments';

export default memo(TaskDocuments);
