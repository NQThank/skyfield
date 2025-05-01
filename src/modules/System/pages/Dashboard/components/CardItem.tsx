import { Box } from '@/core/components';
import { CardInfo } from '@/core/types';
import React from 'react';

interface CardItemProps {
  data: CardInfo;
}

const CardItem: React.FC<CardItemProps> = ({ data }) => {
  return (
    <Box className="p-6">
      <div className="flex items-center justify-between gap-x-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-primary">
          {data.icon}
        </span>
        <div className="flex flex-col gap-y-2">
          <span className="text-3xl font-bold text-gray-700">{data.count}</span>
          <span className="text-base font-semibold text-gray-600">{data.label}</span>
        </div>
      </div>
    </Box>
  );
};

export default CardItem;
