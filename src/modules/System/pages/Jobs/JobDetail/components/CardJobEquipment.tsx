import React, { Fragment, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Divider } from 'antd';

import { AppButton, AppEmpty } from '@/core/components';
import { EquipmentTypes } from '@/core/constants';
import { JobService } from '@/core/services';
import { Equipment } from '@/core/types';
import CardDetail from './CardDetail';
import EquipmentJobModal from './EquipmentJobModal';
import { useRole } from '@/core/hooks';

interface CardJobEquipmentProps {}

const CardJobEquipment: React.FC<CardJobEquipmentProps> = () => {
  const { id } = useParams();
  const { t } = useTranslation(['button']);

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { isEmployee } = useRole();

  const fetchEquipmentsByJobId = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await JobService.getEquipmentsByJobId(id);
      if (res.success) {
        setEquipments(res.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEquipmentsByJobId();
  }, [fetchEquipmentsByJobId]);

  const onEditEquipment = () => {
    setOpen(true);
  };
  return (
    <>
      <CardDetail
        title="Job Equipments"
        extra={
          !isEmployee && (
            <AppButton type="primary" ghost onClick={onEditEquipment}>
              {t(['edit'])}
            </AppButton>
          )
        }
        loading={loading}
      >
        {equipments.length > 0 ? (
          <div>
            {equipments.map((item) => {
              return (
                <Fragment key={item.id}>
                  <div className="py-2">
                    <span>Name: {item.name}</span>
                    <p>Type: {EquipmentTypes.find((el) => el.value === item.type)?.label}</p>
                  </div>
                  <Divider className="!my-1 last:hidden" />
                </Fragment>
              );
            })}
          </div>
        ) : (
          <AppEmpty />
        )}
      </CardDetail>
      <EquipmentJobModal
        open={open}
        onCancel={() => setOpen(false)}
        fetchData={fetchEquipmentsByJobId}
        data={equipments}
      />
    </>
  );
};

export default memo(CardJobEquipment);
