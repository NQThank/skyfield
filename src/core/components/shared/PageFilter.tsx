import { Col, Divider, Form, Input, Radio, Row } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { isUndefined, mapValues, omitBy } from 'lodash';
import React, { Fragment, memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { AppButton, AppDatePicker, AppSelect, MoreFilter } from '@/core/components';
import { DateFormat } from '@/core/enums';
import { CommonService } from '@/core/services';
import { Filter, ScreenPage, SelectType } from '@/core/types';
import { CommonHelper, LogHelper } from '@/utils/helpers';
import AppRangerPicker from '../base/AppRangerPicker';

type PageFilterProps = {
  onSearch?: (value: any) => void;
  filters?: Filter[];
  screen?: ScreenPage;
  showMoreFilter?: boolean;
};
type OptionType = {
  [key: string]: SelectType<string | number>[];
};

type OptionScreen = {
  [key in ScreenPage]?: OptionType;
};

const keysDate = ['start_date', 'end_date'];

const PageFilter: React.FC<PageFilterProps> = ({ onSearch, filters, screen, showMoreFilter = true }) => {
  const { t } = useTranslation(['button']);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const [init, setInit] = useState(false);
  const [filtersOut, setFiltersOut] = useState<Filter[]>([]);
  const [filtersMore, setFiltersMore] = useState<Filter[]>([]);
  const [options, setOptions] = useState<OptionScreen>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!init) {
      const formValues: { [key: string]: string | number | Dayjs | undefined } = {};
      for (const entry of searchParams.entries()) {
        const [param, value] = entry;
        if (keysDate.includes(param)) {
          const date = dayjs(value, DateFormat.YYYYMMDD);
          formValues[param] = date.isValid() ? date : undefined;
        } else {
          formValues[param] = value;
        }
      }
      form.setFieldsValue({ ...formValues });
      setInit(true);
      onSearch?.(formValues);
    }
  }, [form, searchParams, init, onSearch]);

  useEffect(() => {
    if (!filters) return;
    if (filters.length > 2) {
      setFiltersOut(showMoreFilter ? filters.slice(0, 1) : filters);
      setFiltersMore(filters.slice(1));
    } else {
      setFiltersOut(filters.slice());
      setFiltersMore([]);
    }
  }, [filters, showMoreFilter]);

  // init select
  useEffect(() => {
    handleSearch('', 'team_id');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickRadioButton = useCallback(
    (e: any, name: string) => {
      if (form.getFieldValue(name) === e.target.value) {
        form.setFieldValue(name, undefined);
      }
    },
    [form]
  );

  const fetchTeam = useCallback(
    async (value: string, name: string) => {
      if (!screen) return;
      try {
        setLoading(true);
        const res = await CommonService.getTeams(value);
        if (res.success) {
          setOptions((preOptions) => ({
            ...preOptions,
            [screen]: {
              ...(preOptions?.[screen] ?? {}),
              [name]: res.data?.map((item) => ({
                label: item.name,
                value: item.id
              }))
            }
          }));
        }
      } catch (error) {
        LogHelper.logError(error);
      } finally {
        setLoading(false);
      }
    },
    [screen]
  );

  const handleSearch = useCallback(
    (value: string, filterName: string) => {
      if (screen === 'jobs') {
        if (filterName === 'team_id') {
          CommonHelper.debounceFn(value, fetchTeam, filterName);
        }
      }
    },
    [fetchTeam, screen]
  );

  const generateInput = useCallback(
    (filter: Filter) => {
      switch (filter.type) {
        case 'textbox':
          return <Input placeholder={filter.label} allowClear />;
        case 'select':
          return <AppSelect placeholder={filter.label} options={filter.options ?? []} allowClear />;
        case 'radio-group':
          return (
            <Radio.Group optionType="button" buttonStyle="solid">
              {filter?.options?.map((item) => (
                <Radio.Button
                  key={item.value}
                  value={item.value}
                  onClick={(e) => handleClickRadioButton(e, filter.name)}
                >
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          );
        case 'datepicker':
          return <AppDatePicker placeholder={filter.label} className="w-full" allowClear />;
        case 'date-range':
          return <AppRangerPicker placeholder={['Start Date', 'End Date']} className="w-full" allowClear />;
        case 'autocomplete':
          return (
            <AppSelect
              placeholder={filter.label}
              className="w-full"
              allowClear
              showSearch
              filterOption={false}
              loading={loading}
              onSearch={(value) => handleSearch(value, filter.name)}
              options={screen ? options?.[screen]?.[filter.name] ?? [] : []}
            />
          );
      }
    },
    [handleClickRadioButton, handleSearch, options, screen, loading]
  );

  const onFinish = (values: Record<string, any>) => {
    onSearch?.(values);
    const filterValues = omitBy(values, isUndefined);
    // transfer date
    const transferFilterValuesDate = mapValues(filterValues, (value, key) => {
      if (!value) return '';
      return keysDate.includes(key) ? dayjs(value)?.format(DateFormat.YYYYMMDD) ?? '' : value;
    });
    const dateValue = Object.keys(values).includes('date') ? values.date : [];
    if (dateValue && dateValue.length > 0) {
      const paramsFilter = {
        ...filterValues,
        start_date: dayjs(dateValue[0])?.format(DateFormat.YYYYMMDD) ?? '',
        end_date: dayjs(dateValue[1])?.format(DateFormat.YYYYMMDD) ?? '',
        ...(values.date && {})
      };
      delete paramsFilter.date;
      setSearchParams(paramsFilter);
    } else setSearchParams({ ...filterValues, ...transferFilterValuesDate });
    //
  };
  return (
    <Form form={form} layout="vertical" size="large" onFinish={onFinish} className="form-search flex-1">
      <div className="flex items-center justify-between">
        {filtersOut?.length > 0 && (
          <Row gutter={[12, 6]} className="w-full">
            {filtersOut.map((filter) => (
              <Col lg={5} md={6} key={filter.name}>
                <Form.Item name={filter.name}>{generateInput(filter)}</Form.Item>
              </Col>
            ))}

            <Col>
              <Form.Item>
                <AppButton
                  type="primary"
                  ghost
                  htmlType="submit"
                  icon={<i className="fa-sharp fa-regular fa-magnifying-glass" />}
                >
                  {t('search')}
                </AppButton>
              </Form.Item>
            </Col>
          </Row>
        )}

        {filtersMore.length > 0 && showMoreFilter && (
          <MoreFilter
            content={filtersMore.map((filter, index) => (
              <Fragment key={filter.name}>
                <Form.Item name={filter.name} label={filter.label}>
                  {generateInput(filter)}
                </Form.Item>
                {index !== filtersMore.length - 1 && <Divider className="!m-0" />}
              </Fragment>
            ))}
            onSearch={() => form.submit()}
            onReset={() => {
              form.resetFields();
            }}
          />
        )}
      </div>
    </Form>
  );
};

export default memo(PageFilter);
