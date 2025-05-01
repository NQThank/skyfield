import { Skeleton } from 'antd';
import React from 'react';

type ImageSkeletonProps = {
  count?: number;
};

const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {Array(count)
        .fill(1)
        .map((_, index) => (
          <Skeleton.Image key={index} active className="h-24 w-24" />
        ))}
    </div>
  );
};

export default ImageSkeleton;
