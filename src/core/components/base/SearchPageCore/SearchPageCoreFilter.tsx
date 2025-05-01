import { Col, DatePicker, Form, FormInstance, Input, Row, Select } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterItem } from '@/core/types';
import AppButton from '../AppButton';
import { DateFormat } from '@/core/enums';
import { useButtonSize } from '@/core/hooks';

type SearchPageCoreFilterProps = {
  form: FormInstance<any>;
  items: FilterItem[];
  onFilter: (params: any) => void;
  extraFilter?: React.ReactNode;
};

const SearchPageCoreFilter: React.FC<SearchPageCoreFilterProps> = ({ items, onFilter, form, extraFilter }) => {
  const size = useButtonSize();
  const { t } = useTranslation(['common']);
  const [itemsShow, setItemsShow] = useState<FilterItem[]>([]);

  const updateItems = useCallback(() => {
    const itemsFinal: FilterItem[] = [];
    items.forEach((item) => {
      if (!item.conditionDisplay) return itemsFinal.push(item);
      const keys = Object.keys(item.conditionDisplay);
      let isValid = false;

      for (const key of keys) {
        isValid = item.conditionDisplay[key] === form.getFieldValue(key);
        if (!isValid) break;
      }
      if (isValid) {
        itemsFinal.push(item);
      }
    });
    setItemsShow(itemsFinal);
  }, [form, items]);

  useEffect(() => {
    updateItems();
  }, [updateItems]);

  const handleSearch = useCallback((searchText: string, name: string) => {
    console.log('🚀 ~ handleSearch ~ searchText:', searchText, name);
  }, []);

  const generateItem = useCallback(
    (item: FilterItem) => {
      switch (item.type) {
        case 'input':
          return <Input placeholder={t([item.placeholder as any])} allowClear={item.allowClear ?? true} />;
        case 'select':
          return (
            <Select
              placeholder={t([item.placeholder as any])}
              options={item.options?.map((item) => ({ ...item, label: t([item.label as any]) })) ?? []}
              allowClear={item.allowClear ?? true}
              className="w-full"
            />
          );
        case 'autocomplete':
          return (
            <Select
              placeholder={t([item.placeholder as any])}
              options={item.options?.map((item) => ({ ...item, label: t([item.label as any]) })) ?? []}
              allowClear={item.allowClear ?? true}
              className="w-full"
              showSearch
              filterOption={false}
              onSearch={(value) => handleSearch(value, item.name)}
            />
          );
        case 'date':
          return (
            <DatePicker
              placeholder={t([item.placeholder as any])}
              className="w-full"
              picker={item.mode}
              allowClear={item.allowClear ?? true}
            />
          );
        case 'range-date':
          return (
            <DatePicker.RangePicker
              placeholder={(item.placeholder as [string, string]).map((el) => t([el as any])) as [string, string]}
              // showTime
              format={DateFormat['MM/DD/YYYY']}
              allowClear={item.allowClear ?? true}
            />
          );
        default:
          break;
      }
    },
    [t, handleSearch]
  );
  const handleFinish = (values: any) => {
    onFilter(values);
  };
  const initialValues = useMemo(() => {
    return items.reduce<any>((res, current) => {
      res[current.name] = current.defaultValue;
      return res;
    }, {});
  }, [items]);
  return (
    <div className="flex items-center justify-between">
      <Form
        name="form-filter"
        className="form-search flex-1"
        form={form}
        onFinish={handleFinish}
        initialValues={initialValues}
        onValuesChange={() => updateItems()}
        size={size}
      >
        <Row gutter={[12, 6]}>
          {itemsShow.map((item) => (
            <Col key={item.name} {...(item.size ?? { xl: 4, md: 5, sm: 6 })}>
              <Form.Item name={item.name}>{generateItem(item)}</Form.Item>
            </Col>
          ))}
          <Col>
            {itemsShow.length ? (
              <AppButton className="float-right" type="primary" ghost iconType="search" htmlType="submit">
                Search
              </AppButton>
            ) : null}
          </Col>
        </Row>
      </Form>
      {extraFilter}
    </div>
  );
};

export default SearchPageCoreFilter;
