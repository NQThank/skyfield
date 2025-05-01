import { PlusOutlined } from '@ant-design/icons';
import { Col, Form, Input, InputNumber, Modal, ModalProps, Row, Tooltip, UploadFile, UploadProps } from 'antd';
import { AxiosProgressEvent, AxiosRequestConfig } from 'axios';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AppButton, AppDraggable } from '@/core/components';
import { useAppDispatch } from '@/core/hooks';
import { FileService } from '@/core/services';
import { ItemTemplateForm, TJobTemplateItemSubTask } from '@/core/types';
import {
  clearItemTemplateEdit,
  toggleOpenModal,
  updateItemTemplate
} from '@/modules/System/pages/TemplateForm/template-form.slice';
import { FormatHelper } from '@/utils/helpers';

type TemplateItemFormModalProps = ModalProps & {
  data?: TJobTemplateItemSubTask;
};

const { TextArea } = Input;

const TemplateItemFormModal: React.FC<TemplateItemFormModalProps> = ({ open = false, onCancel, data }) => {
  const dispatch = useAppDispatch();
  const [deleteDocumentIds, setDeleteDocumentIds] = useState<string[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [form] = Form.useForm<ItemTemplateForm>();

  useEffect(() => {
    if (data?.value && open) {
      const { label, quantity, value, inspection_instruction } = data.value;
      const payload = {
        label,
        quantity,
        value,
        inspection_instruction
      };
      form.setFieldsValue(payload);
    }
    if (data?.documents) {
      setFileList(data.documents);
    }
  }, [data, form, open]);

  const itemType = useMemo(() => data?.name, [data]);

  const showOption = useMemo(() => itemType === 'check_list' || itemType === 'option', [itemType]);
  const isPhoto = useMemo(() => itemType === 'photo', [itemType]);
  const isPhotoCollection = useMemo(() => itemType === 'photo_collection', [itemType]);
  const isInspectionPhotoCollection = useMemo(() => itemType === 'inspection_photos_collection', [itemType]);
  const isPrePostPhoto = useMemo(() => itemType === 'pre_post_photo', [itemType]);
  const isPunchListInspectionCollection = useMemo(() => itemType === 'punch_list_inspection_collection', [itemType]);

  const onOk = () => {
    form.submit();
  };

  const onFinish = (values: ItemTemplateForm) => {
    if (!data) return;
    dispatch(
      updateItemTemplate({
        ...data,
        value: { ...data.value, ...values },
        documents: fileList,
        add_document_ids: fileList.filter((item) => item.type !== 'old').map((item) => item.uid) ?? [],
        delete_document_ids: deleteDocumentIds
      })
    );
    dispatch(toggleOpenModal('template-item-form-edit'));

    form.resetFields();
  };

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
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
            onSuccess?.(FormatHelper.getFileIds(data)?.[0]);
          }
        } catch (err) {
          console.log('Error: ', err);
        }
      })();
    },
    beforeUpload() {
      return true;
    },
    onChange({ file, fileList }) {
      setFileList(
        fileList.map((item) => {
          if (item.response && item.response !== 'Ok') {
            return { ...item, uid: item.response };
          }
          return item;
        })
      );
      const { status } = file;
      if (status === 'done') {
        toast.success(`${file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        toast.error(`${file.name} file upload failed.`);
      }
    },
    onRemove(file) {
      if (file.type === 'old') {
        setDeleteDocumentIds((preDeleteDocumentIds) => [...preDeleteDocumentIds, file.uid]);
      }
      setFileList((preFileList) => preFileList.filter((item) => item.uid !== file.uid));
    }
  };
  const afterClose = () => {
    form.resetFields();
    setFileList([]);
    dispatch(clearItemTemplateEdit());
  };
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Edit Template Item"
      width={600}
      onOk={onOk}
      afterClose={afterClose}
      destroyOnClose
    >
      <Form form={form} onFinish={onFinish} layout="vertical" className="[&>.ant-form-item]:mb-2">
        <Form.Item label="Label" name={'label'} required>
          <Input placeholder="Label" />
        </Form.Item>
        {showOption && (
          <Form.List name="value">
            {(fields, { add, remove }) => (
              <div className="w-[480px]">
                <Row>
                  {fields.map((field) => (
                    <Col span={24} key={field.key}>
                      <Row gutter={[12, 0]} align="middle">
                        <Col>
                          <Form.Item
                            {...field}
                            label="Label"
                            name={[field.name, 'label']}
                            rules={[{ required: true, message: 'Field is required' }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col>
                          <Form.Item
                            {...field}
                            label="Value"
                            name={[field.name, 'value']}
                            rules={[{ required: true, message: 'Field is required' }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col>
                          <Tooltip title="Delete">
                            <i
                              className="fa-solid fa-trash"
                              onClick={() => remove(field.name)}
                              style={{ cursor: 'pointer' }}
                            />
                          </Tooltip>
                        </Col>
                      </Row>
                    </Col>
                  ))}
                  <Col span={24}>
                    <Form.Item>
                      <AppButton type="primary" ghost={true} onClick={() => add()} icon={<PlusOutlined />}>
                        Add Option
                      </AppButton>
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            )}
          </Form.List>
        )}

        {(isPhoto ||
          isPhotoCollection ||
          isPrePostPhoto ||
          isInspectionPhotoCollection ||
          isPunchListInspectionCollection) && (
          <Form.Item label="Quantity" name={'quantity'} required>
            <InputNumber className="w-full" placeholder="Quantity" />
          </Form.Item>
        )}

        {(isInspectionPhotoCollection || isPunchListInspectionCollection) && (
          <>
            <Form.Item label={isPunchListInspectionCollection ? 'Inspection Images' : 'Example Image'}>
              <AppDraggable {...props}>
                <p>Click or drag file to this area to upload inspection images</p>
              </AppDraggable>
            </Form.Item>
            <Form.Item label="Inspection Instruction" name="inspection_instruction">
              <TextArea disabled={isPunchListInspectionCollection} />
            </Form.Item>
          </>
        )}
        {isPrePostPhoto && (
          <Form.Item label="Punch List Photo">
            <AppDraggable disabled>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
            </AppDraggable>
          </Form.Item>
        )}
        {(isPrePostPhoto || isPunchListInspectionCollection) && (
          <Form.Item label="Description">
            <TextArea disabled placeholder="Description" />
          </Form.Item>
        )}
        {(isPhoto || isPrePostPhoto || isInspectionPhotoCollection || isPunchListInspectionCollection) && (
          <Form.Item label="Comment" name={'comment'}>
            <TextArea disabled placeholder="Comment" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default memo(TemplateItemFormModal);
