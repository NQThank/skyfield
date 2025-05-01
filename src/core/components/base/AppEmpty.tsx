import { Empty, EmptyProps, Image } from 'antd';
import React from 'react';

import emptyImage from '@/assets/images/empty.png';

type AppEmptyProps = EmptyProps;

const AppEmpty: React.FC<AppEmptyProps> = (props) => {
  return (
    <Empty image={<Image src={emptyImage} preview={false} height={80} />} description="Data not available" {...props} />
  );
};

export default AppEmpty;
