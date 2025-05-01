import { Col, Row, Spin } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { AppButton } from '@/core/components';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { GeneralInfoForm } from '@/core/types';
import { resetCommon } from '../common.slice';
import { SectorPositionModal, TemplateDocument, TemplateGeneralInfo, TemplatePreviewModal } from './components';
import { FormRef } from './components/TemplateGeneralInfo';
import { reset, toggleOpenModal } from './template-form.slice';
import { SubTaskDetailGroup, SubTaskView } from '@/core/components/sections/tasks';

interface TemplateFormProps {
  onSubmit: (values: GeneralInfoForm) => Promise<void>;
  submitting: boolean;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ onSubmit, submitting }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const formRef = useRef<FormRef>(null);
  const [open, setOpen] = useState(false);

  const {
    loading: { loadingData },
    template: { generalInfo },
    isOpen
  } = useAppSelector((root) => root.templateForm);

  const { t } = useTranslation(['button', 'message']);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (generalInfo) {
      formRef.current?.setFieldsValue({
        ...generalInfo
      });
    }
  }, [generalInfo]);

  useEffect(() => {
    return () => {
      dispatch(reset());
      dispatch(resetCommon());
    };
  }, [dispatch]);

  const onClick = () => {
    formRef.current?.submit();
  };

  const data = useMemo(() => {
    return { ...generalInfo, ...formRef.current?.getFieldsValue() };
  }, [generalInfo]);

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <>
      <Spin spinning={loadingData}>
        <div className="flex flex-col gap-y-4 pb-4" id="template">
          <div className="flex justify-end gap-x-4">
            <AppButton type="text" size="large" disabled={submitting} onClick={onCancel}>
              {t(['cancel'])}
            </AppButton>
            <AppButton
              type="primary"
              icon={<i className="fa-sharp fa-solid fa-plus" />}
              size="large"
              onClick={onClick}
              loading={submitting}
            >
              {id ? t('update') : t('add')}
            </AppButton>
          </div>
          <Row gutter={[24, 24]}>
            <Col xl={8} lg={10} sm={24}>
              <div className="flex flex-col gap-y-4">
                <TemplateGeneralInfo ref={formRef} onSubmit={onSubmit} />
                <SubTaskView />
                <TemplateDocument />
              </div>
            </Col>
            <Col xl={16} lg={14} sm={24}>
              <SubTaskDetailGroup />
            </Col>
          </Row>
        </div>
      </Spin>
      <TemplatePreviewModal open={open} onCancel={() => setOpen(false)} data={data} />
      <SectorPositionModal
        open={isOpen['sector-position']}
        onCancel={() => dispatch(toggleOpenModal('sector-position'))}
      />
    </>
  );
};

export default TemplateForm;
