import { Affix, Card, Col, Row } from 'antd';
import clsx from 'clsx';
import React, { memo, useEffect, useState } from 'react';

import { AppEmpty } from '@/core/components';
import { FilterItemMap } from '@/core/constants';
import { useAppDispatch, useAppSelector } from '@/core/hooks';
import { FilterItemType, FormItem } from '@/core/types';
import { fetchFormItems } from '../template-form.slice';
import TemplateFormItem from './TemplateFormItem';

interface TemplateFormItemListListProps {}

const TemplateFormItemList: React.FC<TemplateFormItemListListProps> = () => {
  const {
    formItems,
    loading: { loadingFormItems }
  } = useAppSelector((root) => root.templateForm);
  const dispatch = useAppDispatch();
  const [filterActive, setFilterActive] = useState<FilterItemType>('all');
  const [itemsLocal, setItemsLocal] = useState<FormItem[]>(formItems);

  useEffect(() => {
    dispatch(fetchFormItems());
  }, [dispatch]);

  useEffect(() => {
    if (filterActive === 'all') {
      setItemsLocal(formItems);
    } else {
      const types = FilterItemMap[filterActive]?.types ?? [];
      setItemsLocal(formItems.filter((item) => types.includes(item.name)));
    }
  }, [filterActive, formItems]);

  const onActiveFilter = (key: FilterItemType) => {
    setFilterActive(key);
  };

  return (
    <Affix offsetTop={0} target={() => document.querySelector('.default-layout__content') as HTMLElement}>
      <Card
        title={
          <div className="flex flex-wrap justify-center gap-4 py-2">
            {(Object.keys(FilterItemMap) as FilterItemType[]).map((key) => (
              <div
                key={key}
                className={clsx(
                  'min-w-[48px] cursor-pointer rounded-lg border border-solid border-primary bg-orange-50 px-2 py-1 text-center text-primary hover:opacity-70',
                  { 'border-none !bg-primary text-white': filterActive === key }
                )}
                onClick={() => onActiveFilter(key)}
              >
                {FilterItemMap[key]?.label}
              </div>
            ))}
          </div>
        }
      >
        <div>
          {loadingFormItems && (
            <div className="flex gap-x-4">
              {Array(3)
                .fill(1)
                .map((_, index) => (
                  <div className="h-24 w-24 animate-pulse rounded-lg bg-slate-200" key={index}></div>
                ))}
            </div>
          )}
          {!loadingFormItems &&
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
