import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Col, Row, Spin } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { AppButton } from '@/core/components';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { FormItemType, ITemplateItem, PayloadJobTemplate } from '@/core/types';
import { CommonHelper, FormatHelper } from '@/utils/helpers';
import { resetCommon } from '../common.slice';
import { SectorPositionModal, TemplateDocument, TemplatePreviewModal } from './components';
import { FormRefJobTemplate } from './components/TemplateGeneralInfo';
import { addTemplateItemSubTask, reset, toggleOpenModal } from './template-form.slice';
import TemplateGeneralInfoJobTemplate from './components/TemplateGeneralInfoJobTemplate';
import CardMilestoneTemplate from '../Jobs/JobDetail/components/JobTemplate/CardMilestoneTemplate';
import { MileStoneType } from '../JobTemplateForm';

type TemplateFormProps = {
  onSubmit: (values: PayloadJobTemplate) => Promise<void>;
  submitting: boolean;
  list: {
    milestone: MileStoneType[];
    setMilestone: (value: MileStoneType[]) => void;
  };
};

const TemplateJobForm: React.FC<TemplateFormProps> = ({ onSubmit, submitting, list }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const formRef = useRef<FormRefJobTemplate>(null);
  const [open, setOpen] = useState(false);

  const {
    formItems,
    loading: { loadingData },
    template: { generalInfo },
    isOpen
  } = useAppSelector((root) => root.templateForm);

  const { t } = useTranslation(['button', 'message']);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (generalInfo) {
      formRef.current?.setFieldsValue({
        ...(generalInfo as any)
      });
    }
  }, [generalInfo]);

  useEffect(() => {
    return () => {
      dispatch(reset());
      dispatch(resetCommon());
    };
  }, [dispatch]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    const formItemType: FormItemType = active.data.current?.name;
    const formItem = formItems.find((item) => item.name === formItemType);
    if (!formItem || !over?.id) return;
    const subTaskId = over.id as string;
    const option: ITemplateItem = {
      id: CommonHelper.generateStr(),
      value: FormatHelper.tryParseJson(formItem.master_value),
      name: formItemType,
      order_value: 1,
      parent_id: subTaskId
    };
    dispatch(addTemplateItemSubTask({ subTaskId, data: option }));
  };

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
                <TemplateGeneralInfoJobTemplate ref={formRef} onSubmit={onSubmit} />
                <TemplateDocument />
              </div>
            </Col>
            <Col xl={16} lg={14} sm={24}>
              <DndContext onDragEnd={onDragEnd}>
                <CardMilestoneTemplate list={list} />
              </DndContext>
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

export default TemplateJobForm;
