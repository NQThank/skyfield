import { Col, Divider, Modal, ModalProps, Row } from 'antd';
import React from 'react';

import { useJobTask } from '@/store';
import SubTaskDetailGroup from './SubTaskDetailGroup';
import { DataHelper } from '@/utils/helpers';
import { LocationTypeEnum, PriorityEnum, TemplateTypeEnum } from '@/core/enums';

type PreviewModalProps = ModalProps;

const PreviewModal: React.FC<PreviewModalProps> = ({ ...props }) => {
  const { jobTaskInfo } = useJobTask();
  return (
    <Modal {...props} title={jobTaskInfo?.name} footer={null} width={1000}>
      <Row>
        <Col span={8}>
          <span>Location Type: {DataHelper.getEnumKeyByValue(jobTaskInfo?.location_type, LocationTypeEnum)} </span>
        </Col>
        <Col span={8}>
          <span>Type: {DataHelper.getEnumKeyByValue(jobTaskInfo?.type, TemplateTypeEnum)}</span>
        </Col>
        <Col span={8}>
          <span>Priority: {DataHelper.getEnumKeyByValue(jobTaskInfo?.priority, PriorityEnum)}</span>
        </Col>
      </Row>
      <Divider />
      <SubTaskDetailGroup preview />
    </Modal>
  );
};

export default PreviewModal;
