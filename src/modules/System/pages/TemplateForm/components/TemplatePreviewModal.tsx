import { Col, Divider, Row } from 'antd';
import React, { memo } from 'react';

import { AppButton, AppModal } from '@/core/components';
import { LocationTypeEnum, PriorityEnum, TemplateTypeEnum } from '@/core/enums';
import { useAppSelector } from '@/core/hooks';
import { ModalBaseProps } from '@/core/types';
import { DataHelper } from '@/utils/helpers';
import TemplateSectorPositionsDetail from './TemplateSectorPositionsDetail';

type TemplatePreviewModalProps = ModalBaseProps<any>;

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ open, onCancel }) => {
  const { name, generalInfo } = useAppSelector((state) => state.templateForm.template);

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      width={900}
      title={name}
      footer={
        <div className="flex justify-end">
          <AppButton onClick={onCancel}>Cancel</AppButton>
        </div>
      }
    >
      <Row>
        <Col span={8}>
          <span>Location Type: {DataHelper.getEnumKeyByValue(generalInfo?.location_type, LocationTypeEnum)} </span>
        </Col>
        <Col span={8}>
          <span>Type: {DataHelper.getEnumKeyByValue(generalInfo?.type, TemplateTypeEnum)}</span>
        </Col>
        <Col span={8}>
          <span>Priority: {DataHelper.getEnumKeyByValue(generalInfo?.priority, PriorityEnum)}</span>
        </Col>
      </Row>
      <Divider />
      <TemplateSectorPositionsDetail isPreview />
    </AppModal>
  );
};

export default memo(TemplatePreviewModal);
