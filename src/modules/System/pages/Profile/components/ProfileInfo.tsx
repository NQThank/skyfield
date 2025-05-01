import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { AppButton, EmployeeProfile } from '@/core/components';
import { APP_NAME } from '@/core/constants';
import { PathLabelEnum } from '@/core/enums';
import { MeService } from '@/core/services';
import { Employee } from '@/core/types';
import EditProfileModal from './EditProfileModal';

type ProfileInfoProps = {};

const ProfileInfo: React.FC<ProfileInfoProps> = () => {
  const [data, setData] = useState<Employee>();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await MeService.getProfile();
      const { success, data } = res;
      if (success && data) {
        setData(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onEditProfile = () => {
    setOpen(true);
  };
  return (
    <>
      <Helmet>
        <title>{`${APP_NAME} - ${PathLabelEnum.profile}`}</title>
      </Helmet>
      <div className="flex flex-col gap-y-4">
        <div className="flex justify-end">
          <AppButton type="primary" ghost iconType="edit" size="large" onClick={onEditProfile}>
            Edit Profile
          </AppButton>
        </div>
        <EmployeeProfile data={data} loading={loading} />
      </div>
      <EditProfileModal open={open} onCancel={() => setOpen(false)} data={data} fetchData={fetchProfile} />
    </>
  );
};

export default ProfileInfo;
