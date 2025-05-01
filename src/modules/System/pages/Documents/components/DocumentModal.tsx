import { Form, message, UploadFile, UploadProps } from 'antd';
import { useEffect, useState } from 'react';
import * as yup from 'yup';

import { AppDraggable, AppModal } from '@/core/components';
import { useAppDispatch, useForm } from '@/core/hooks';

import { resetCommon } from '../../common.slice';
import { Equipment, ModalBaseProps } from '@/core/types';
import fileService from '@/core/services/file.service';
import { RcFile } from 'antd/es/upload';

const schema = yup.object({
  documents: yup.array().of(yup.mixed<UploadFile>())
});

type JobForm = yup.InferType<typeof schema>;
type IEquipmentModalProps = ModalBaseProps<Equipment>;

const DocumentModal: React.FC<IEquipmentModalProps> = ({ open, onCancel, fetchData }) => {
  const dispatch = useAppDispatch();
  const [loading, _setLoading] = useState(false);
  const [submitting, _setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const {
    formField: { form, ...formProps }
  } = useForm<JobForm>({
    schema,
    async onSubmit(data) {
      if (!data) return;

      _setSubmitting(true);
      try {
        const formData = new FormData();
        if (fileList.length > 0) {
          formData.append('files', fileList[0] as RcFile);
        }

        const res = await fileService.uploadFile(formData);
        if (res.success && res.data) {
          message.success('Upload successful');
          onCancel();
          fetchData?.();
        }
      } catch (error) {
        console.log(error);
        message.error('Upload failed');
      } finally {
        _setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    return () => {
      dispatch(resetCommon());
    };
  }, [dispatch]);

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const props: UploadProps = {
    name: 'file',
    headers: {
      authorization: 'authorization-text'
    },
    showUploadList: true,
    multiple: false,
    maxCount: 1,
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]); // Xóa file khỏi danh sách
    }
  };

  const onOk = () => {
    form.submit();
  };

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      title={'Create document'}
      onOk={onOk}
      width={800}
      confirmLoading={loading}
      afterClose={() => form.resetFields()}
    >
      <Form form={form} {...formProps} layout="vertical" disabled={submitting}>
        <Form.Item
          label="Document"
          colon={true}
          wrapperCol={{ span: 24 }}
          labelAlign={'left'}
          name="documents"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          className="no-float-label"
        >
          <AppDraggable {...props} />
        </Form.Item>
      </Form>
    </AppModal>
  );
};

export default DocumentModal;
