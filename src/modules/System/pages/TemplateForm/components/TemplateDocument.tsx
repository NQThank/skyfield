import { UploadProps } from 'antd';
import { cloneDeep } from 'lodash';
import React, { memo } from 'react';
import { toast } from 'sonner';

import { AppCollapse, AppDraggable } from '@/core/components';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { updateDocumentIdsDelete, updateDocumentList } from '../template-form.slice';

interface TemplateDocumentProps {}

const TemplateDocument: React.FC<TemplateDocumentProps> = () => {
  const dispatch = useAppDispatch();

  const { documentList } = useAppSelector((state) => state.templateForm.template);
  const props: UploadProps = {
    name: 'file',
    multiple: true,
    fileList: documentList,
    beforeUpload() {
      // const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
      // const isImage = validImageTypes.includes(file.type);
      // if (!isImage) {
      //   toast.error(`${file.name} is not a image file`);
      // }
      // return isImage || Upload.LIST_IGNORE;
      return true;
    },

    onChange({ file, fileList }) {
      dispatch(updateDocumentList(cloneDeep(fileList)));
      const { status } = file;
      if (status === 'done') {
        toast.success(`${file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        toast.error(`${file.name} file upload failed.`);
      }
    },
    onRemove(file) {
      if (file.type === 'old') {
        dispatch(updateDocumentIdsDelete(file.uid));
      }
      dispatch(updateDocumentList(documentList.filter((item) => item.uid !== file.uid)));
    }
  };

  return (
    <AppCollapse
      activeKey={'document'}
      items={[
        {
          key: 'document',
          label: 'Document',
          children: <AppDraggable {...props} />,
          showArrow: false
        }
      ]}
    />
  );
};

export default memo(TemplateDocument);
