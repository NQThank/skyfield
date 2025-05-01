import { Col, Form, Row } from 'antd';
import { memo } from 'react';

import { InfoItem } from '@/core/types';

type ViewInfosProps<T> = {
  items: InfoItem<T>[];
  data?: T;
};

function ViewInfos<T>({ items, data }: Readonly<ViewInfosProps<T>>) {
  return (
    <Form>
      <Row gutter={[12, 6]}>
        {items.map(({ dataIndex, render, label, size }) => (
          <Col
            key={dataIndex as string}
            {...(size ?? { span: 24 })}
            className="border-0 border-b border-solid border-gray-200 py-2"
          >
            <Form.Item
              label={label}
              colon={false}
              labelCol={{ span: 8 }}
              labelAlign="left"
              className="mb-0 [&>.ant-form-item-row>.ant-form-item-label>label]:!text-gray-500 "
            >
              <span>{render ? render(data?.[dataIndex], data) : ((data?.[dataIndex] ?? '') as string)}</span>
            </Form.Item>
          </Col>
        ))}
      </Row>
    </Form>
  );
}

export default memo(ViewInfos);
