import React, { useMemo } from 'react';
import colors from 'tailwindcss/colors';

import AppStatus from '../../base/AppStatus';
import { JobImageStatus } from '@/core/types';

type ImageStatusProps = {
  status: JobImageStatus;
};

const ImageStatus: React.FC<ImageStatusProps> = ({ status }) => {
  const statusColor = useMemo(() => {
    switch (status) {
      case 'UPLOADED':
        return colors.gray['500'];
      case 'APPROVE':
        return colors.green['500'];
      case 'REJECT':
        return colors.red['500'];
      default:
        return colors.gray['500'];
    }
  }, [status]);
  return (
    <AppStatus type="tag" color={statusColor}>
      {status}
    </AppStatus>
  );
};

export default ImageStatus;
