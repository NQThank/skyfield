import { Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AppModal, AppSelect } from '@/core/components';
import { JobService, TeamService } from '@/core/services';
import { ModalBaseProps, Team } from '@/core/types';
import { CommonHelper } from '@/utils/helpers';

type TeamJobModalProps = ModalBaseProps<Team>;

const TeamJobModal: React.FC<TeamJobModalProps> = ({ open, onCancel, fetchData, data }) => {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [teams, setTeams] = useState<Team[]>(data ? [data] : []);
  const [teamId, setTeamId] = useState<string | undefined>(data?.id);

  useEffect(() => {
    if (open) {
      data && setTeams([data]);
      data && setTeamId(data.id);
    }
  }, [open, data]);

  const fetchTeams = useCallback(async (value: string) => {
    setLoading(true);
    try {
      const res = await TeamService.getTeamList({ page_number: 1, page_size: 10, q: value });
      if (res.success) {
        setTeams(res.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = (value: string) => {
    CommonHelper.debounceFn(value, fetchTeams);
  };

  const onOk = async () => {
    if (!id || !teamId) return;
    setSubmitting(true);
    try {
      const res = await JobService.updateTeamJob(id, { team_id: teamId });
      if (res.success) {
        fetchData?.();
        onCancel();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      confirmLoading={submitting}
      open={open}
      onCancel={onCancel}
      title="Update Team"
      onOk={onOk}
      afterClose={() => {
        setTeamId(undefined);
        setTeams([]);
      }}
    >
      <label htmlFor="team" className="text-label">
        Team
      </label>
      <AppSelect
        id="team"
        loading={loading}
        showSearch
        filterOption={false}
        onSearch={onSearch}
        className="w-full"
        value={teamId}
        onChange={setTeamId}
      >
        {teams.map((equipment) => (
          <Select.Option key={equipment.id} value={equipment.id}>
            {equipment.name}
          </Select.Option>
        ))}
      </AppSelect>
    </AppModal>
  );
};

export default TeamJobModal;
