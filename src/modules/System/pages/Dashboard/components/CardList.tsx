import { CardInfo } from '@/core/types';
import React, { useMemo } from 'react';
import CardItem from './CardItem';
import { Col, Row } from 'antd';

interface CardListProps {
  data: any;
}

const CardList: React.FC<CardListProps> = ({ data }) => {
  const cardInfos: CardInfo[] = useMemo(() => {
    return [
      {
        icon: <i className="fa-solid fa-diagram-project" />,
        label: 'Projects',
        count: data.project_count
      },
      {
        icon: <i className="fa-duotone fa-user-secret" />,
        label: 'Clients',
        count: data.customer_count
      },
      {
        icon: <i className="fa-solid fa-list-check" />,
        label: 'Tasks',
        count: data.task_count
      },
      {
        icon: <i className="fa-solid fa-user" />,
        label: 'User',
        count: data.user_count
      }
    ];
  }, [data]);
  return (
    <Row gutter={[24, 12]}>
      {cardInfos.map((card, index) => (
        <Col key={index} xl={6} md={8}>
          <CardItem data={card} />
        </Col>
      ))}
    </Row>
  );
};

export default CardList;
