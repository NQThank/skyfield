import { Image, ImageProps } from 'antd';
import clsx from 'clsx';
import React from 'react';

type GalleryImageProps = ImageProps & {
  active?: boolean;
  onClick?: () => void;
  className?: string;
  status?: 'REJECT' | 'APPROVE';
};
const borderImage = {
  REJECT: 'border-1 border-solid border-red-500',
  APPROVE: 'border-1 border-solid border-green-600'
};
const GalleryImage: React.FC<GalleryImageProps> = ({ active = false, onClick, className, status, ...props }) => {
  return (
    <div
      className={clsx(
        'h-24 w-24 cursor-pointer overflow-hidden rounded-lg border-2 border-solid border-transparent p-0.5 ',
        className,
        {
          '!border-primary': active
        }
      )}
      onClick={onClick}
    >
      <Image
        alt="Image"
        className={` !h-full !w-full rounded-lg ${
          status && ['REJECT', 'APPROVE'].includes(status) ? borderImage[status] : ''
        } `}
        rootClassName="h-full w-full hover:[&>.ant-image-mask]:rounded-lg"
        preview={false}
        {...props}
      />
    </div>
  );
};

export default GalleryImage;
