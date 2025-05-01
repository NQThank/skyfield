import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Col, Form, Input, Radio, Row, Select, Spin, Tabs, TabsProps, Upload, UploadFile } from 'antd';
import { RcFile } from 'antd/es/upload';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as yup from 'yup';

import { AppButton, AppDatePicker, AppSelect, Box } from '@/core/components';
import { EmployeeStatus, EmployeeTypes } from '@/core/constants';
import { DateFormat } from '@/core/enums';
import { useAppDispatch, useForm } from '@/core/hooks';
import { EmployeeService, TeamService } from '@/core/services';
import {
  Employee,
  EmployeePayload,
  EmployeePayloadEdit,
  ResponseCommon,
  Team,
  UserStatusType,
  UserType
} from '@/core/types';
import { CommonHelper, FileHelper, FormatHelper } from '@/utils/helpers';
import { resetCommon } from '../../common.slice';
import CertificatePage from '../../Certificate';

const { TextArea } = Input;

const schema = yup.object({
  first_name: yup.string().required(),
  middle_name: yup.string().nullable(),
  last_name: yup.string().required(),
  address: yup.string().nullable(),
  company: yup.string().nullable(),
  phone: yup
    .string()
    .label('Phone Number')
    .test({
      test: (value) => {
        if (!value) return true;
        return CommonHelper.isValidPhoneNumber(value);
      },
      message: 'Phone number is invalid'
    })
    .nullable(),
  email: yup.string().email().required(),
  type: yup.string().oneOf<UserType>(['admin', 'employee', 'pm']).required(),
  hire_date: yup.mixed().nullable(),
  termination_date: yup.mixed().nullable(),
  password: yup.string().min(8).label('Password').required(),
  confirm_password: yup
    .string()
    .label('Confirm password')
    .test('passwords-match', 'Passwords must match', function (value) {
      return this.parent.password === value;
    })
    .required(),
  notes: yup.string().nullable(),
  positions: yup.string().nullable(),
  status: yup.string().oneOf<UserStatusType>(['active', 'disabled', 'inactive', 'pending']).required(),
  payroll_type: yup.string().nullable(),
  payroll_rate: yup.number().nullable(),
  team_id: yup.string().when('type', {
    is: 'employee',
    then: (schema) => schema.required(),
    otherwise(schema) {
      return schema;
    }
  })
});

const schemaEdit = schema.omit(['password', 'confirm_password', 'email']).concat(
  yup.object({
    avatar: yup.array().of(yup.mixed<UploadFile>())
  })
);

type EmployeeFormType = yup.InferType<typeof schema>;

type EmployeeFormTypeEdit = yup.InferType<typeof schemaEdit>;

type Props = {
  onCancelPopup?: () => void;
  id?: string;
  fetchData?: () => void;
};

const EmployeeForm = ({ onCancelPopup, id, fetchData }: Props) => {
  const { t } = useTranslation(['message', 'button']);
  const dispatch = useAppDispatch();

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee>();
  const [imageUrl, setImageUrl] = useState<string>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const isFormEdit = (object: any): object is EmployeeFormTypeEdit => {
    return 'avatar' in object;
  };

  const isEmployeePayload = (object: any): object is EmployeePayload => {
    return 'password' in object;
  };

  const {
    formField: { form, ...props }
  } = useForm<EmployeeFormType | EmployeeFormTypeEdit>({
    schema: id ? schemaEdit : schema,
    onSubmit: async (values) => {
      if (!values) return;
      try {
        setSubmitting(true);
        let res: ResponseCommon<null> | null = null;
        const payload: EmployeePayload | EmployeePayloadEdit = {
          ...values,
          hire_date: dayjs.isDayjs(values?.hire_date) ? values.hire_date.format(DateFormat.YYYYMMDDHHmm) : '',
          termination_date: dayjs.isDayjs(values?.termination_date)
            ? values.termination_date.format(DateFormat.YYYYMMDDHHmm)
            : ''
        };
        if (!id && isEmployeePayload(payload)) {
          res = await EmployeeService.addEmployee(payload);
        } else if (id) {
          if (isFormEdit(values) && values?.avatar?.[0]) {
            const formData = new FormData();
            formData.append('file', values.avatar[0].originFileObj as Blob);
            const response = await EmployeeService.uploadAvatar(id, formData);
            if (response.success) {
              payload.signature_url = response.data;
            }
          }
          res = await EmployeeService.updateEmployee(id, payload);
        }
        if (res?.success) {
          toast.success(t('success'));
          onCancel();
          fetchData?.();
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  const type = Form.useWatch('type', form);

  useEffect(() => {
    onSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      dispatch(resetCommon());
    };
  }, [dispatch]);

  const avatar = Form.useWatch('avatar', form);

  useEffect(() => {
    if (avatar?.[0]?.originFileObj) {
      FileHelper.getBase64(avatar[0]?.originFileObj, (url) => {
        setImageUrl(url);
      });
    }
  }, [avatar]);

  useEffect(() => {
    if (!id) {
      form.resetFields();
      return;
    }
    const fetchEmployeeById = async () => {
      try {
        setLoading(true);
        const { success, data } = await EmployeeService.getEmployeeById(id);
        if (success && data) {
          setEmployee(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeById();
  }, [id, dispatch, form]);

  useEffect(() => {
    if (id && employee) {
      form.setFieldsValue({
        ...employee,
        hire_date: employee.hire_date && dayjs(employee.hire_date),
        termination_date: employee.termination_date && dayjs(employee.termination_date)
      });
      if (employee.avatar_path) {
        setImageUrl(`${process.env.REACT_APP_BASE_URL}${employee.avatar_path}`);
      }
    }
  }, [id, employee, form]);

  const formLayoutItem = useMemo(
    () => ({
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    }),
    []
  );

  const buttonOkText = useMemo(() => {
    if (id) {
      return submitting ? t(['button:updating']) : t(['button:update']);
    } else {
      return submitting ? t(['button:adding']) : t(['button:add']);
    }
  }, [id, t, submitting]);

  // handle disabled terminate date
  const disabledTerminateDate: any = (currentDate: Dayjs) => {
    const startDate: Dayjs | undefined = form.getFieldValue('hire_date');
    if (!startDate) return false;
    return dayjs(currentDate.startOf('day'))?.isSameOrBefore(startDate.startOf('day'));
  };

  const onAdd = () => {
    form.submit();
  };

  const onCancel = () => {
    onCancelPopup?.();
    setEmployee(undefined);
    form.resetFields();
  };

  const onChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = FormatHelper.formatPhoneNumber(e.target.value);
    form.setFieldValue('phone', phoneNumber);
  };

  const normFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      toast.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      toast.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const fetchTeam = useCallback(async (value: string) => {
    setLoadingTeam(true);
    try {
      const res = await TeamService.getTeamList({ page_number: 1, page_size: 10, q: value });
      if (res.success) {
        setTeams(res.data ?? []);
      }
    } finally {
      setLoadingTeam(false);
    }
  }, []);

  const onSearch = (value: string) => {
    CommonHelper.debounceFn(value, fetchTeam);
  };
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'User Information',
      children: (
        <>
          <Row gutter={[24, 24]}>
            <Col xl={8} md={12} sm={24}>
              <Box className="py-4">
                {/* <h2 className="mb-2">User Information</h2> */}
                <Form.Item label="First Name" name={'first_name'} required>
                  <Input placeholder="First Name" />
                </Form.Item>
                <Form.Item label="Middle Name" name={'middle_name'}>
                  <Input placeholder="Middle Name" />
                </Form.Item>
                <Form.Item label="Last Name" name={'last_name'} required>
                  <Input placeholder="Last Name" />
                </Form.Item>
                <Form.Item label="Phone" name={'phone'}>
                  <Input placeholder="(XXX) XXX-XXXX" onChange={onChangePhoneNumber} />
                </Form.Item>

                {!id && (
                  <>
                    <Form.Item label="Email" name={'email'} required>
                      <Input placeholder="Email" />
                    </Form.Item>
                    <Form.Item label="Password" name={'password'} required>
                      <Input.Password placeholder="Password" autoComplete="new-password" />
                    </Form.Item>
                    <Form.Item label="Confirm Password" name={'confirm_password'} required>
                      <Input.Password placeholder="Confirm Password" />
                    </Form.Item>
                  </>
                )}

                <Form.Item label="Status" name={'status'} required>
                  <Radio.Group options={EmployeeStatus} buttonStyle="solid" optionType="button" />
                </Form.Item>
              </Box>
            </Col>
            <Col xl={16} md={12} sm={24}>
              <Box className="py-4">
                {/* <h2 className="mb-2">More Information</h2> */}
                <Row gutter={[24, 0]}>
                  <Col xl={12} sm={24}>
                    <Form.Item label="Company" name={'company'}>
                      <Input placeholder="Company" />
                    </Form.Item>
                    <Form.Item label="Positions" name={'positions'}>
                      <Input placeholder="Positions" />
                    </Form.Item>
                    <Form.Item label="Payroll Type" name={'payroll_type'}>
                      <Input placeholder="Payroll Type" />
                    </Form.Item>
                    <Form.Item label="Payroll Rate" name={'payroll_rate'}>
                      <Input placeholder="Payroll Rate" />
                    </Form.Item>
                    <Form.Item label="Notes" name={'notes'}>
                      <TextArea placeholder="Notes" />
                    </Form.Item>
                  </Col>
                  <Col xl={12} sm={24}>
                    <Form.Item label="Hire Date" name={'hire_date'}>
                      <AppDatePicker placeholder="Hire Date" className="w-full" />
                    </Form.Item>
                    <Form.Item label="Terminate Date" name={'termination_date'}>
                      <AppDatePicker
                        placeholder="Terminate Date"
                        disabledDate={disabledTerminateDate}
                        className="w-full"
                      />
                    </Form.Item>
                    <Form.Item label="User Type" name={'type'} required>
                      <AppSelect placeholder="Choose User Type" options={EmployeeTypes} />
                    </Form.Item>
                    {type === 'employee' && (
                      <Form.Item label="Team" name="team_id" required={type === 'employee'}>
                        <AppSelect
                          placeholder="Team"
                          showSearch
                          onSearch={onSearch}
                          filterOption={false}
                          loading={loadingTeam}
                        >
                          {teams?.map((item) => (
                            <Select.Option key={item.id} value={item.id}>
                              {item.name}
                            </Select.Option>
                          ))}
                        </AppSelect>
                      </Form.Item>
                    )}
                    <Form.Item label="Address" name={'address'}>
                      <Input placeholder="Address" />
                    </Form.Item>
                  </Col>
                  {/* <Col span={24}>
                    <Form.Item label="Notes" name={'notes'}>
                      <TextArea placeholder="Notes" />
                    </Form.Item>
                  </Col> */}
                  {id && (
                    <Col span={24}>
                      <Form.Item label="Avatar" name="avatar" valuePropName="fileList" getValueFromEvent={normFile}>
                        <Upload
                          accept="image/*"
                          maxCount={1}
                          listType="picture-circle"
                          className="avatar-uploader"
                          showUploadList={false}
                          beforeUpload={beforeUpload}
                          customRequest={() => {}}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt="avatar"
                              className="h-full w-full rounded-full object-contain shadow-lg"
                            />
                          ) : (
                            uploadButton
                          )}
                        </Upload>
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </Box>
              <div className="mt-4 flex justify-end gap-x-4">
                <AppButton type="text" disabled={submitting || loading} onClick={onCancel}>
                  {t(['button:cancel'])}
                </AppButton>
                <AppButton type="primary" onClick={onAdd} loading={submitting} disabled={loading}>
                  {buttonOkText}
                </AppButton>
              </div>
            </Col>
          </Row>
        </>
      )
    },
    {
      key: '2',
      label: 'Certificate',
      children: <CertificatePage employee={employee} loading={loading} fetchData={fetchData} />
    }
  ];
  return (
    <div className="flex flex-col gap-y-4">
      <Spin spinning={loading}>
        <Form
          form={form}
          {...props}
          {...formLayoutItem}
          size="middle"
          labelAlign="left"
          colon={false}
          layout="vertical"
          disabled={submitting}
        >
          <Tabs defaultActiveKey="1" items={items} />
        </Form>
      </Spin>
    </div>
  );
};

export default EmployeeForm;
