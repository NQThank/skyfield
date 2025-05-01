import { Affix, Card, Col, Row } from 'antd';
import clsx from 'clsx';
import React, { memo, useEffect, useState } from 'react';

import { AppEmpty } from '@/core/components';
import { FilterItemMap } from '@/core/constants';
import { CommonService } from '@/core/services';
import { FilterItemType, FormItem } from '@/core/types';
import TemplateFormItem from './TemplateFormItem';
import { useJobTask } from '@/store';

interface TemplateFormItemListListProps {}

const TemplateFormItemList: React.FC<TemplateFormItemListListProps> = () => {
  const { setFormItems } = useJobTask();

  const [filterActive, setFilterActive] = useState<FilterItemType>('all');
  const [items, setItems] = useState<FormItem[]>([]);
  const [itemsLocal, setItemsLocal] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await CommonService.getFormItemTypes();
        if (res.success) {
          setItems(res.data ?? []);
          setFormItems(res.data ?? []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [setFormItems]);

  useEffect(() => {
    if (filterActive === 'all') {
      setItemsLocal(items);
    } else {
      const types = FilterItemMap[filterActive]?.types ?? [];
      setItemsLocal(items.filter((item) => types.includes(item.name)));
    }
  }, [filterActive, items]);

  const onActiveFilter = (key: FilterItemType) => {
    setFilterActive(key);
  };

  return (
    <Affix offsetTop={0} target={() => document.querySelector('.default-layout__content') as HTMLElement}>
      <Card
        title={
          <div className="flex flex-wrap justify-center gap-4 py-2">
            <BuildTemplateTypeList onActive={onActiveFilter} keyActive={filterActive} />
          </div>
        }
      >
        <div>
          {loading && (
            <div className="flex gap-x-4">
              {Array(3)
                .fill(1)
                .map((_, index) => (
                  <div className="h-24 w-24 animate-pulse rounded-lg bg-slate-200" key={index}></div>
                ))}
            </div>
          )}
          {!loading &&
            (itemsLocal?.length <= 0 ? (
              <Row justify={'center'} className="w-100">
                <Col>
                  <AppEmpty />
                </Col>
              </Row>
            ) : (
              <div className="flex flex-row flex-wrap gap-4 bg-white">
                {itemsLocal.map((item) => (
                  <TemplateFormItem key={item.id} item={item} />
                ))}
              </div>
            ))}
        </div>
      </Card>
    </Affix>
  );
};

export default memo(TemplateFormItemList);

type BuildTemplateTypeListProps = {
  onActive: (key: FilterItemType) => void;
  keyActive: FilterItemType;
};

const BuildTemplateTypeList: React.FC<BuildTemplateTypeListProps> = ({ onActive, keyActive }) => {
  return (
    <>
      {(Object.keys(FilterItemMap) as FilterItemType[]).map((key) => (
        <div
          key={key}
          className={clsx(
            'min-w-[48px] cursor-pointer rounded-lg border border-solid border-primary bg-orange-50 px-2 py-1 text-center text-primary hover:opacity-70',
            { 'border-none !bg-primary text-white': keyActive === key }
          )}
          onClick={() => onActive(key)}
        >
          {FilterItemMap[key]?.label}
        </div>
      ))}
    </>
  );
};
