import { Col, Progress, Row } from 'antd';
import { orderBy } from 'lodash';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { AppButton, AppEmpty } from '@/core/components';
import SortableList from '@/core/components/SortableList';
import { useRole } from '@/core/hooks';
import { JobService } from '@/core/services';
import { ActionType, JobMilestone } from '@/core/types';
import { MileStoneType } from '@/modules/System/pages/JobTemplateForm';
import { LogHelper } from '@/utils/helpers';
import CardDetail from '../CardDetail';
import MilestoneItem from '../MilestoneItem';
import MilestoneItemTemplate from './MilestoneItemTemplate';
import MilestoneModalTemplate from './MilestoneModalTemplate';

export type ListAddMilestone = {
  milestone: MileStoneType[];
  setMilestone: (value: MileStoneType[]) => void;
};
interface CardMilestoneProps {
  list: ListAddMilestone;
}

const CardMilestone: React.FC<CardMilestoneProps> = ({ list }) => {
  const { t } = useTranslation(['button']);

  const { id } = useParams();
  const [jobMilestones, setJobMilestones] = useState<JobMilestone[]>([]);
  const [open, setOpen] = useState(false);
  const [_loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<ActionType>();
  const [dataSelected, setDataSelected] = useState<JobMilestone>();

  const { isEmployee } = useRole();

  const fetchMilestoneByJobId = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await JobService.getMilestonesByJobId(id || '');
      if (res.success) {
        const orderMilestone = orderBy(res.data ?? [], ['order_value'], 'asc');
        setJobMilestones(orderMilestone);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMilestoneByJobId();
  }, [fetchMilestoneByJobId]);

  useEffect(() => {
    if (!open) {
      setDataSelected(undefined);
    }
  }, [open]);

  const onAddMilestone = () => {
    setOpen(true);
    setActionType('add');
  };

  const onEditMilestone = useCallback((jobMilestone: JobMilestone) => {
    setOpen(true);
    setActionType('edit');
    setDataSelected(jobMilestone);
  }, []);

  const updateOrder = async (items: JobMilestone[], orderFrom: number, orderTo: number) => {
    try {
      if (!id) return;
      const milestoneFrom = items[orderTo];
      const milestoneTo = items[orderFrom];
      await JobService.updateOrderMilestone(id, milestoneFrom.id, orderTo + 1);
      await JobService.updateOrderMilestone(id, milestoneTo.id, orderFrom + 1);
    } catch (error) {
      LogHelper.logError(error);
    }
  };

  const percent = useMemo(() => {
    if (jobMilestones.length === 0) return 0;
    const jobComplete = jobMilestones.filter((item) => item.status === 'done');
    return Number(((jobComplete.length / jobMilestones.length) * 100).toFixed(2));
  }, [jobMilestones]);

  const onSortable = (items: JobMilestone[], activeId: number, overId: number) => {
    setJobMilestones(items);
    updateOrder(items, activeId, overId);
  };

  return (
    <>
      <CardDetail
        className="p-4"
        title="Job Milestones & Tasks"
        extra={
          !isEmployee && (
            <AppButton
              size="large"
              type="primary"
              ghost
              icon={<i className="fa-sharp fa-solid fa-plus" />}
              onClick={onAddMilestone}
            >
              {t(['add_milestone'])}
            </AppButton>
          )
        }
      >
        {list.milestone?.length > 0 ? (
          <>
            <Progress
              className="w-[98%]"
              percent={percent}
              status="active"
              strokeColor={{ from: '#108ee9', to: '#87d068' }}
            />
            <SortableList
              items={jobMilestones}
              onChange={onSortable}
              renderItem={(item) => (
                <SortableList.Item id={item.id}>
                  <MilestoneItem data={item}>
                    <SortableList.DragHandle />
                  </MilestoneItem>
                </SortableList.Item>
              )}
            >
              <Row gutter={[12, 12]} wrap={false} className="scrollbar overflow-x-auto overflow-y-hidden p-4">
                {list.milestone?.map((item: MileStoneType, index: number) => (
                  <Col xxl={6} xl={8} key={`${item.id}_${index}`}>
                    <SortableList.Item id={index}>
                      <MilestoneItemTemplate data={item} list={list} onEditMilestone={onEditMilestone}>
                        <SortableList.DragHandle />
                      </MilestoneItemTemplate>
                    </SortableList.Item>
                  </Col>
                ))}
              </Row>
            </SortableList>
          </>
        ) : (
          <AppEmpty />
        )}
      </CardDetail>
      <MilestoneModalTemplate
        open={open}
        onCancel={() => setOpen(false)}
        actionType={actionType}
        data={dataSelected}
        fetchData={fetchMilestoneByJobId}
        count={jobMilestones.length}
        list={list}
      />
    </>
  );
};

export default memo(CardMilestone);
