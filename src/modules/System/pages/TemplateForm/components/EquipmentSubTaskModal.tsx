import { Col, Form, FormInstance, InputNumber, Modal, Row, Select, Tooltip } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { BaseSelectRef } from 'rc-select/lib/BaseSelect';
import { GetComponentProps } from 'rc-table/lib/interface';
import React, { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AppButton, AppTable } from '@/core/components';
import { EquipmentTypes } from '@/core/constants';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { CommonService } from '@/core/services';
import { Action, Equipment, EquipmentSubTask, ModalBaseProps } from '@/core/types';
import { CommonHelper, LogHelper } from '@/utils/helpers';
import { deleteEquipmentSubTask, setEquipmentsSubTask } from '../template-form.slice';

interface EquipmentSubTaskModalProps extends ModalBaseProps<Equipment> {}

interface OnCell<T> extends GetComponentProps<T> {
  record: any;
  editable: boolean;
  title: string;
  inputType: InputType;
  options: any;
  onSave: () => void;
}

interface ColumnTable<T> extends ColumnType<T> {
  editable?: boolean;
  onCell?: OnCell<T>;
}
type InputType = 'select' | 'number';

const EquipmentSubTaskModal: React.FC<EquipmentSubTaskModalProps> = ({ open: isOpen, onCancel }) => {
  const { t } = useTranslation(['message', 'button']);

  const [equipmentsSubTaskLocal, setEquipmentsSubTaskLocal] = useState<EquipmentSubTask[]>([]);
  const [idAutoAdd, setIdAutoAdd] = useState<string | null>(null);
  const [equipmentsInit, setEquipmentsInit] = useState<Equipment[]>([]);

  const {
    subTaskActive,
    template: { equipmentsSubTask }
  } = useAppSelector((state) => state.templateForm);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setEquipmentsSubTaskLocal((subTaskActive?.id && equipmentsSubTask?.[subTaskActive?.id]) || []);
  }, [subTaskActive, equipmentsSubTask]);

  const fetchEquipments = useCallback(async (value: string) => {
    try {
      const res = await CommonService.getEquipments(value);
      if (res.success) {
        setEquipmentsInit(res.data ?? []);
      }
    } catch (error) {
      LogHelper.logError(error);
    }
  }, []);

  useEffect(() => {
    isOpen && fetchEquipments('');
  }, [isOpen, fetchEquipments]);

  const onSave = useCallback(
    (row: EquipmentSubTask, dataIndex: string) => {
      const newData = [...equipmentsSubTaskLocal];
      const index = newData.findIndex((item) => row?.id === item?.id);
      const item = newData[index];
      const newDataItem = { ...item, ...row };
      if (dataIndex === 'equipment_id') {
        // Check duplicate when choose equipment
        const findDuplicate = newData.filter((item) => item[dataIndex] === row[dataIndex]);
        if (findDuplicate.length >= 2 || (findDuplicate.length === 1 && findDuplicate[0].id !== newDataItem.id)) {
          toast.error(t('duplicate equipment'));
          return false;
        }
      }
      newData.splice(index, 1, newDataItem);
      const _idAutoAdd = CommonHelper.generateStr();
      //when edit like row auto add => add 1 new row
      if (!idAutoAdd || idAutoAdd === row.id) {
        setEquipmentsSubTaskLocal([
          ...newData,
          {
            id: _idAutoAdd,
            quantity: 0
          }
        ]);
        setIdAutoAdd(_idAutoAdd);
      } else {
        // else => save data and no add 1 new row, set id row auto add null
        setEquipmentsSubTaskLocal(newData);
        setIdAutoAdd(null);
      }
      return true;
    },
    [equipmentsSubTaskLocal, idAutoAdd, t]
  );
  const onDelete = useCallback(
    (record: EquipmentSubTask) => {
      const newData = equipmentsSubTaskLocal.filter((item) => item?.id !== record.id);
      setEquipmentsSubTaskLocal(newData);
      if (record.id === idAutoAdd) {
        setIdAutoAdd(null);
      }
      dispatch(deleteEquipmentSubTask(record.uid));
    },
    [equipmentsSubTaskLocal, idAutoAdd, dispatch]
  );

  const actions = useMemo<Action[]>(
    () => [
      {
        label: t(['button:delete']),
        type: 'delete',
        callback: onDelete
      }
    ],
    [t, onDelete]
  );

  const defaultColumns = useMemo<ColumnTable<EquipmentSubTask>[]>(() => {
    return [
      {
        title: 'Name',
        key: 'equipment_id',
        dataIndex: 'equipment_id',
        editable: true,
        width: 350,
        render(_, record) {
          return record.equipment_name ?? '';
        }
      },
      {
        title: 'Type',
        key: 'type',
        dataIndex: 'equipment_type',
        width: 120,
        render(type) {
          return EquipmentTypes.find((item) => item.value === type)?.label ?? '';
        }
      },
      {
        title: 'Quantity',
        key: 'quantity',
        dataIndex: 'quantity',
        editable: true,
        width: 150,
        align: 'right'
      },
      {
        title: 'Serial Number',
        key: 'serial_number',
        dataIndex: 'serial_number',
        width: 150
      }
    ];
  }, []);
  const columns = useMemo(
    () =>
      defaultColumns.map((col) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: (record: any) => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title as string,
            inputType: (col.dataIndex === 'equipment_id' ? 'select' : 'number') as InputType,
            onSave,
            equipmentsInit
          })
        };
      }),
    [defaultColumns, onSave, equipmentsInit]
  );
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  };
  const validateEquipmentSubTask = () => {
    return new Promise((resolve, reject) => {
      equipmentsSubTaskLocal.forEach((equipmentSubTask) => {
        if (!equipmentSubTask.equipment_id) {
          reject(new Error(t('choose_equipment')));
        }
      });
      resolve(true);
    });
  };

  const onAddEquipment = async () => {
    try {
      await validateEquipmentSubTask();
      setEquipmentsSubTaskLocal((pre) => [...pre, { id: CommonHelper.generateStr(), quantity: 0 }]);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const onOk = async () => {
    try {
      await validateEquipmentSubTask();
      subTaskActive &&
        dispatch(
          setEquipmentsSubTask({
            subTaskId: subTaskActive?.id,
            data: equipmentsSubTaskLocal?.filter((item) => item?.equipment_id)
          })
        );
      onCancel();
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      onOk={onOk}
      width={'70%'}
      title={t('add_equipment', { name: subTaskActive?.title })}
      maskClosable={false}
    >
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <AppButton onClick={onAddEquipment} type="primary" ghost>
            {t('button:add_equipment')}
          </AppButton>
        </Col>
        <Col span={24}>
          <AppTable
            columns={columns}
            actions={actions}
            showPagination={false}
            dataSource={equipmentsSubTaskLocal}
            rowKey="id"
            components={components}
          />
        </Col>
      </Row>
    </Modal>
  );
};

interface ContextType extends FormInstance<any> {}
const EditableContext = createContext<ContextType | null>(null);

const EditableRow = ({ ...props }) => {
  const [form] = Form.useForm<any>();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell: React.FC<any> = ({
  inputType,
  title,
  editable,
  children,
  dataIndex,
  record,
  onSave,
  equipmentsInit,
  ...restProps
}) => {
  const { t } = useTranslation(['message']);
  const [editing, setEditing] = useState(false);
  const selectRef = useRef<BaseSelectRef>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const form = useContext(EditableContext);
  const [loading, setLoading] = useState(false);
  const [equipments, setEquipments] = useState<Equipment[]>(equipmentsInit);

  useEffect(() => {
    if (editing) {
      inputRef?.current?.focus();
      form?.setFieldsValue({
        [dataIndex]: record?.[dataIndex]
      });
    }
  }, [editing, form, dataIndex, record]);
  const toggleEdit = () => {
    setEditing(!editing);
    form?.setFieldsValue({
      [dataIndex]: record[dataIndex]
    });
    if (dataIndex === 'equipment_id' && record?.equipment_id) {
      setEquipments((preEquipments) => [
        ...preEquipments,
        {
          id: record.equipment_id,
          name: record.name,
          type: 'bill_of_material'
        }
      ]);
    }
  };
  const save = async () => {
    if (!form) return;
    try {
      const values = await form.validateFields();
      const payload = { ...record, ...values };
      if (dataIndex === 'equipment_id') {
        const equipment = equipments.find((item) => item.id === values.equipment_id);
        payload.equipment_name = equipment?.name;
        payload.equipment_type = equipment?.type;
      }
      const result = onSave(payload, dataIndex);
      result && toggleEdit();
      !result &&
        form.setFieldsValue({
          [dataIndex]: null
        });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
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
  const inputNode = () => {
    if (inputType === 'select') {
      return (
        <Select
          ref={selectRef}
          onBlur={save}
          onChange={save}
          filterOption={false}
          showSearch
          onSearch={onSearch}
          className="w-full"
          loading={loading}
        >
          {equipments?.map((item: Equipment) => {
            return (
              <Select.Option key={item?.id} value={item?.id}>
                {item?.name}
              </Select.Option>
            );
          })}
        </Select>
      );
    } else if (inputType === 'number') {
      return <InputNumber ref={inputRef} onBlur={save} min={0} />;
    }
  };
  let childNode = children;
  if (editable) {
    if (editing) {
      childNode = (
        <Form.Item
          style={{
            margin: 0
          }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `${title} is required.`
            }
          ]}
        >
          {inputNode()}
        </Form.Item>
      );
    } else {
      if (dataIndex === 'equipment_id') {
        childNode = (
          <Row gutter={[8, 8]} align={'middle'}>
            <Col span={20}>
              <div>{record?.equipment_name ?? ''}</div>
            </Col>
            <Col span={4}>
              <span>
                <Tooltip title={t('edit')}>
                  <AppButton
                    icon={<i className="fa-solid fa-pen-to-square fa-sm text-[#1677ff]" />}
                    onClick={toggleEdit}
                    type="text"
                    shape="circle"
                  />
                </Tooltip>
              </span>
            </Col>
          </Row>
        );
      } else {
        childNode = (
          <div
            style={{
              paddingRight: 24
            }}
          >
            {children}
            <span>
              <Tooltip title={t('edit')}>
                <AppButton
                  icon={<i className="fa-solid fa-pen-to-square fa-sm text-[#1677ff]" />}
                  onClick={toggleEdit}
                  type="text"
                  shape="circle"
                />
              </Tooltip>
            </span>
          </div>
        );
      }
    }
  }

  return <td {...restProps}>{childNode}</td>;
};

export default memo(EquipmentSubTaskModal);
