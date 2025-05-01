import { Col, Form, Input, message, Row, Spin, Upload, UploadProps } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { AppButton } from '@/core/components';
import { useForm } from '@/core/hooks';

import fileService from '@/core/services/file.service';
import { useParams } from 'react-router-dom';
import { JobService } from '@/core/services';
import { UploadRequestError } from 'rc-upload/lib/interface';
import { RcFile } from 'antd/es/upload';

const schema = yup.object({
  name: yup.string(),
  description: yup.string()
});

type JobForm = yup.InferType<typeof schema>;
type Props = {
  fetchData: () => void;
  onCancel: () => void;
};
const ModalIssue = ({ fetchData, onCancel }: Props) => {
  const { t } = useTranslation(['message', 'button']);
  const { id } = useParams();
  const [idFiles, setIdFiles] = useState<{ id: string; name: string }[]>([]);
  const [fileList, setFileList] = useState<RcFile[]>([]);

  const [loading, _setLoading] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);

  const {
    formField: { form, ...formProps }
  } = useForm<JobForm>({
    schema,
    async onSubmit(data) {
      if (!data) return;

      try {
        setSubmitting(true);
        _setLoading(true);
        const payload = {
          name: data.name,
          description: data.description,
          document_ids: idFiles.map((file) => file.id)
        };

        const res = await JobService.createIssueById(id || '', payload);
        if (res.success) {
          message.success('Create issue success');
          fetchData();
        }
      } finally {
        _setLoading(false);
        setSubmitting(false);
        onCancel();
        setIdFiles([]); // Clear the images
        setFileList([]); // Clear the file list
        form.resetFields();
      }
    }
  });

  const props: UploadProps = {
    name: 'file',
    headers: {
      authorization: 'authorization-text'
    },
    accept: '.png,.jpg,.jpeg',
    showUploadList: true,
    multiple: true,
    listType: 'picture-card',
    fileList: fileList,
    onChange: ({ fileList }) => setFileList(fileList),
    customRequest: async (options) => {
      const { onSuccess, onError, file } = options;
      try {
        const formData = new FormData();
        formData.append('files', file as RcFile);
        const res = await fileService.uploadFile(formData);
        if (res.success && res.data && id) {
          const resTemps = Object.values(res.data[0])[0];
          const updatedFiles = [...idFiles, { id: resTemps, name: (file as RcFile).name }];
          setIdFiles(updatedFiles);
          if (onSuccess) {
            onSuccess('ok');
          }
        }
      } catch (error) {
        console.log(error);
        message.error('Upload failed');
        if (onError) {
          onError(error as UploadRequestError);
        }
      }
    },
    onRemove(file) {
      const updatedFiles = idFiles.filter((f) => f.name !== file.name);
      setIdFiles(updatedFiles);
    }
  };

  return (
    <div className="flex flex-col gap-y-2">
      <Spin spinning={loading}>
        <Form
          labelCol={{ span: 6 }}
          labelAlign="left"
          wrapperCol={{ span: 18 }}
          form={form}
          {...formProps}
          layout="horizontal"
          disabled={submitting}
        >
          <Row gutter={[24, 0]}>
            <Col md={24} sm={24} xs={24}>
              <Form.Item name="name" label="Name Note">
                <Input placeholder="Name Note" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input placeholder="Description" />
              </Form.Item>
              <Form.Item label="Image">
                <Upload {...props}>Add new image</Upload>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 6]} justify={'end'}>
            <Col>
              <AppButton type="primary" htmlType="submit" loading={submitting}>
                {t(['button:add'])}
              </AppButton>
            </Col>
          </Row>
        </Form>
      </Spin>
    </div>
  );
};

export default ModalIssue;
