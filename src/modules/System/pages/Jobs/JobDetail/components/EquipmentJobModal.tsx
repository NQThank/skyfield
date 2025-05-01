import { Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AppModal, AppSelect } from '@/core/components';
import { CommonService, JobService } from '@/core/services';
import { Equipment, ModalBaseProps } from '@/core/types';
import { CommonHelper } from '@/utils/helpers';

type EquipmentJobModalProps = ModalBaseProps<Equipment[]>;

const EquipmentJobModal: React.FC<EquipmentJobModalProps> = ({ open, onCancel, data, fetchData }) => {
  const { id } = useParams();
  const [equipments, setEquipments] = useState<Equipment[]>(data ?? []);
  const [equipmentIds, setEquipmentIds] = useState<string[]>(data?.map((item) => item.id) ?? []);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEquipmentIds(data?.map((item) => item.id) ?? []);
      setEquipments(data ?? []);
    }
  }, [open, data]);

  const fetchEquipments = useCallback(async (value: string) => {
    setLoading(true);
    try {
      const res = await CommonService.getEquipments(value);
      if (res.success) {
        setEquipments(res.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = (value: string) => {
    CommonHelper.debounceFn(value, fetchEquipments);
  };

  const onOk = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await JobService.updateEquipmentsJob(id, { equipment_ids: equipmentIds });
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
      title="Update Equipment"
      afterClose={() => {
        setEquipmentIds([]);
      }}
      onOk={onOk}
    >
      <label htmlFor="equipment" className="text-label">
        Equipment
      </label>
      <AppSelect
        mode="multiple"
        id="equipment"
        loading={loading}
        showSearch
        filterOption={false}
        onSearch={onSearch}
        className="w-full"
        value={equipmentIds}
        onChange={setEquipmentIds}
      >
        {equipments.map((equipment) => (
          <Select.Option key={equipment.id} value={equipment.id}>
            {equipment.name}
          </Select.Option>
        ))}
      </AppSelect>
    </AppModal>
  );
};

export default EquipmentJobModal;
