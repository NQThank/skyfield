import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { AppButton, AppEmpty } from '@/core/components';
import { JobService } from '@/core/services';
import { Team } from '@/core/types';
import CardDetail from './CardDetail';
import TeamJobModal from './TeamJobModal';
import { useRole } from '@/core/hooks';

interface CardJobTeamProps {}

const CardJobTeam: React.FC<CardJobTeamProps> = () => {
  const { id } = useParams();
  const { t } = useTranslation(['button']);

  const { isEmployee } = useRole();

  const [team, setTeam] = useState<Team>();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchTeamsByJobId = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await JobService.getTeamByJobId(id);
      if (res.success) {
        setTeam(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeamsByJobId();
  }, [fetchTeamsByJobId]);

  const onEditTeam = () => {
    setOpen(true);
  };

  return (
    <>
      <CardDetail
        title={`Team: ${team?.name ?? ''}`}
        extra={
          !isEmployee && (
            <AppButton type="primary" ghost onClick={onEditTeam}>
              {t(['edit'])}
            </AppButton>
          )
        }
        loading={loading}
      >
        {team ? (
          <>
            <Avatar icon={<UserOutlined />} />
            <span className="ml-2">{team?.pm_name ?? ''}</span>
          </>
        ) : (
          <AppEmpty />
        )}
      </CardDetail>
      <TeamJobModal open={open} onCancel={() => setOpen(false)} data={team} fetchData={fetchTeamsByJobId} />
    </>
  );
};

export default memo(CardJobTeam);
