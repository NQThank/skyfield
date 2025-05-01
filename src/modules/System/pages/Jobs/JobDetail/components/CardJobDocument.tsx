import { Spin, UploadFile, UploadProps } from 'antd';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AppButton, AppDraggable } from '@/core/components';
import { FileService, JobService } from '@/core/services';
import { DataHelper, FormatHelper } from '@/utils/helpers';
import CardDetail from './CardDetail';
import { useRole } from '@/core/hooks';

interface CardJobDocumentProps {}

const CardJobDocument: React.FC<CardJobDocumentProps> = () => {
  const { id } = useParams();
  const { t } = useTranslation(['button', 'message']);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDocumentIds, setDeleteDocumentIds] = useState<string[]>([]);

  const { isEmployee } = useRole();

  const fetchDocuments = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, success } = await JobService.getDocumentsByJobId(id);
      if (success && data) {
        const _fileList: UploadFile[] = [];
        Object.keys(data).forEach((item) => {
          _fileList.push({
            uid: FormatHelper.getUUIDFromPathFile(data[item]),
            name: item,
            status: 'done',
            percent: 100,
            type: 'old',
            url: DataHelper.getUrlFile(data[item])
          });
        });
        setFileList(_fileList);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {});
  const props: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    onChange({ file, fileList }) {
      const { status } = file;
      setFileList(fileList);
      if (status === 'done') {
        toast.success(`${file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        toast.error(`${file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    onRemove(file) {
      if (file.type === 'old') {
        setDeleteDocumentIds((preDeleteDocumentIds) => [...preDeleteDocumentIds, file.uid]);
      }
      setFileList((preFileList) => preFileList.filter((item) => item.uid !== file.uid));
    }
  };

  const onUpdateDocument = async () => {
    if (!id) return;
    try {
      setSubmitting(true);
      const add_document_ids: string[] = [];
      const filesAdd = fileList.filter((item) => item.type !== 'old');
      const formData = new FormData();
      if (filesAdd.length > 0) {
        filesAdd.forEach((file) => {
          formData.append('files', file?.originFileObj as Blob);
        });
        const res = await FileService.uploadFile(formData);
        if (res.success && res.data) {
          add_document_ids.push(...FormatHelper.getFileIds(res.data));
        }
      }
      const { success } = await JobService.updateDocument(id, {
        add_document_ids,
        delete_document_ids: deleteDocumentIds
      });
      if (success) {
        fetchDocuments();
        toast.success(t(['message:success']));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CardDetail
      title="Job Documents"
      extra={
        !isEmployee && (
          <AppButton type="primary" ghost onClick={onUpdateDocument} loading={submitting}>
            {t(['update'])}
          </AppButton>
        )
      }
    >
      <Spin spinning={loading}>
        <AppDraggable {...props} />
      </Spin>
    </CardDetail>
  );
};

export default memo(CardJobDocument);
