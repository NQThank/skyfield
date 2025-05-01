import { Col, Dropdown, Flex, MenuProps, Row } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { JobStatusTag } from '@/core/components';
import { actions } from '@/core/constants';
import { MainLayout } from '@/core/layout';
import { JobService } from '@/core/services';
import { JobDetail1 } from '@/core/types';
import { FormatHelper, LogHelper } from '@/utils/helpers';
import {
  CardJobDailyReport,
  CardJobDocument,
  CardJobEquipment,
  CardJobInfo,
  CardJobIssues,
  CardJobTeam,
  CardMilestone
} from './components';
import { useAppDispatch } from '@/core/hooks';
import { resetCommon, setNameMap } from '../../common.slice';

const JobDetailPage = () => {
  const { t } = useTranslation(['message']);
  const dispatch = useAppDispatch();

  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [jobDetail, setJobDetail] = useState<JobDetail1>();

  const fetchJobDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(false);
      const { success, data } = await JobService.getJobById(id);
      if (success && data) {
        setJobDetail(data);
        dispatch(setNameMap({ [id]: data.name ?? '' }));
      }
    } catch (error) {
      LogHelper.logError(error);
    } finally {
      setLoading(false);
    }
  }, [id, dispatch]);

  useEffect(() => {
    fetchJobDetail();
  }, [fetchJobDetail]);

  useEffect(() => {
    return () => {
      dispatch(resetCommon());
    };
  }, [dispatch]);

  const jobDetailData = useMemo(() => {
    if (!jobDetail) return;
    const { description, name, site_location, project, scope_of_work, start_date, end_date } = jobDetail;

    return {
      contact: '',
      customer: project?.customer?.name ?? '',
      description: description ?? '',
      name: name ?? '',
      phone_number: '',
      scope_of_work: scope_of_work ?? '',
      site_location: site_location?.address ?? '',
      start_end_date: `${FormatHelper.formatDate(start_date)} - ${FormatHelper.formatDate(end_date)}`,
      tower_owner: site_location?.structural_owner ?? '',
      tower_owner_poc: site_location?.structural_name ?? '',
      tower_type: site_location?.structural_type ?? '',
      lat: Number(site_location?.latitude) || null,
      lng: Number(site_location?.longitude) || null
    };
  }, [jobDetail]);

  const menuProps: MenuProps = useMemo(
    () => ({
      items: jobDetail?.status ? actions.filter((item) => item.status?.includes(jobDetail.status as string)) : [],
      onClick: async ({ key }) => {
        if (!id) return;
        setLoading(true);
        try {
          const res = await JobService.updateStatusJob(id, key);
          if (res.success) {
            toast.success(t('success'));
            fetchJobDetail();
          }
        } finally {
          setLoading(false);
        }
      }
    }),
    [jobDetail, fetchJobDetail, id, t]
  );

  return (
    <MainLayout
      title={jobDetail?.name ?? ''}
      actions={
        <Row align={'middle'} gutter={[12, 24]}>
          <Col>{jobDetail?.status && <JobStatusTag status={jobDetail.status} />}</Col>
          {!!menuProps?.items?.length && (
            <Col>
              <Dropdown.Button menu={menuProps}>Action</Dropdown.Button>
            </Col>
          )}
        </Row>
      }
    >
      <Row gutter={[24, 24]}>
        <Col xl={17} lg={14} sm={24}>
          <Flex vertical gap={'large'}>
            <CardJobInfo jobDetail={jobDetailData} loading={loading} />
            <CardMilestone />
          </Flex>
        </Col>
        <Col xl={7} lg={10} sm={24}>
          <Flex vertical gap={'large'}>
            <CardJobDocument />
            <CardJobEquipment />
            <CardJobDailyReport data={(jobDetail?.job_daily_reports as any) ?? []} />
            <CardJobTeam />
            <CardJobIssues data={jobDetail?.job_issues ?? []} />
          </Flex>
        </Col>
      </Row>
    </MainLayout>
  );
};

export default JobDetailPage;
