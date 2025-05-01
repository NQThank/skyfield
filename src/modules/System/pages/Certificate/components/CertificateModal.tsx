import { DatePicker, Form, Input, Select, Upload, Button, Image } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { AppModal } from '@/core/components';
import { useForm } from '@/core/hooks';
import fileService from '@/core/services/file.service';
import { Employee, EmployeeCertPayload, ModalBaseProps, ResponseCommon } from '@/core/types';

type CertificateModalProps = ModalBaseProps<any> & {
  employee: Employee;
  // onCancelPopup: () => void;
};
import * as yup from 'yup';
import { DataHelper } from '@/utils/helpers';
import { DateFormat } from '@/core/enums';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { EmployeeService } from '@/core/services';

const schema = yup.object({
  name: yup.string().required(),
  type: yup.string().required().oneOf(['safety', 'technical'], 'Invalid type'),
  issue_date: yup.date().nullable().required(),
  expire_date: yup.date().nullable().required().min(yup.ref('issue_date'), 'Expire Date must be after Issue Date')
});

const CertificateModal: React.FC<CertificateModalProps> = ({
  open,
  onCancel,
  actionType,
  data,
  fetchData,
  employee
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const formLayoutItem = useMemo(() => ({ labelCol: { span: 8 }, wrapperCol: { span: 16 } }), []);
  const {
    formField: { form, ...props }
  } = useForm({
    schema, // Replace with the actual Yup schema if available
    onSubmit: async (values) => {
      if (!values) return;
      let res: ResponseCommon<null> | null = null;
      if (!uploadedFile) {
        toast.error('Image is required!');
        return;
      }

      const payload: EmployeeCertPayload = {
        ...values,
        issue_date: dayjs(values.issue_date).format(DateFormat['YYYYMMDD']),
        expire_date: dayjs(values.expire_date).format(DateFormat['YYYYMMDD']),
        document_id: uploadedFile
      };
      console.log('payload', payload);
      try {
        if (actionType === 'add') {
          res = await EmployeeService.addEmployeeCert(employee.id, payload);
        } else if (actionType === 'edit' && data) {
          res = await EmployeeService.updateEmployeeCert(employee.id, data.id, payload);
        }
        if (res?.success) {
          fetchData?.();
          onCancel();
          toast.success('Success');
        }
      } catch {
        (error: any) => {
          console.log(error);
          toast.error('Error');
        };
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (open && actionType === 'edit' && data) {
      form.setFieldsValue({ ...data, issue_date: dayjs(data?.issue_date), expire_date: dayjs(data?.expire_date) });
      setUploadedFile(`${data?.document_id}`);
    }
  }, [actionType, form, data, open]);

  const handleUpload = async (info: any) => {
    const formData = new FormData();
    formData.append('files', info.file);
    try {
      const res = await fileService.uploadFile(formData);
      if (res.success && res.data) {
        setUploadedFile(`${Object.values(res.data[0])[0]}`); // Lưu URL file đã upload
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const renderFilePreview = () => {
    if (!uploadedFile) return null;

    // const isImage = /\.(png|jpe?g)$/i.test(uploadedFile);
    // const isPDF = /\.pdf$/i.test(uploadedFile);
    // console.log('isImage', isImage);

    // if (isImage) {
    return (
      <Image className="mt-5 max-h-60" src={DataHelper.getUrlFile(uploadedFile)} alt="Uploaded File" width={200} />
    );
    // }

    // if (isPDF) {
    //   return (
    //     <iframe
    //       src={DataHelper.getUrlFile(uploadedFile)}
    //       title="PDF Preview"
    //       style={{ width: '100%', height: '400px', border: 'none' }}
    //     />
    //   );
    // }

    return <p>Unsupported file type</p>;
  };

  const title = useMemo(() => `${actionType === 'add' ? 'Add' : 'Edit'} Certificate`, [actionType]);

  const onOk = () => {
    form.submit();
  };

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      title={title}
      confirmLoading={loading}
      afterClose={() => {
        form.resetFields();
        setUploadedFile(null);
      }}
    >
      <Form form={form} {...props} {...formLayoutItem} labelAlign="left" colon={false} labelWrap>
        <Form.Item label="Certificate Name" name="name" required>
          <Input placeholder="Certificate Name" />
        </Form.Item>

        <Form.Item label="Type" name="type" required>
          <Select
            placeholder="Type"
            options={[
              { label: 'Safety', value: 'safety' },
              { label: 'Technical', value: 'technical' }
            ]}
          />
        </Form.Item>

        <Form.Item label="Issue Date" name="issue_date" required>
          <DatePicker placeholder="Issue Date" className="w-full" />
        </Form.Item>

        <Form.Item label="Expire Date" name="expire_date" required>
          <DatePicker placeholder="Expire Date" className="w-full" />
        </Form.Item>

        <Form.Item label="Upload File" required className="">
          <Upload name="file" accept=".png,.jpg,.jpeg,.pdf" showUploadList={false} customRequest={handleUpload}>
            <Button icon={<UploadOutlined />}>Upload File</Button>
          </Upload>
          {renderFilePreview()}
        </Form.Item>
      </Form>
    </AppModal>
  );
};

export default CertificateModal;
