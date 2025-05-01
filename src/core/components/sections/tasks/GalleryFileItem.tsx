import React from 'react';

import { JobImage } from '@/core/types';
import FormItemDraggable from './FormItemDraggable';
import GalleryImage from './GalleryImage';
import { DataHelper } from '@/utils/helpers';
import { useJobTask } from '@/store';

type GalleryFileItemProps = {
  data: JobImage;
};

const GalleryFileItem: React.FC<GalleryFileItemProps> = ({ data }) => {
  const { galleryImagesActive, setGalleryImagesActive } = useJobTask();

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    const isActive = galleryImagesActive.some((image) => image.id === data.id);
    if (isActive) {
      const updatedGalleryImagesActive = galleryImagesActive.filter((image) => image.id !== data.id);
      setGalleryImagesActive(updatedGalleryImagesActive);
    } else {
      setGalleryImagesActive([...galleryImagesActive, data]);
    }
  };

  return (
    <div
      className={`relative rounded-lg ${
        galleryImagesActive.find((item) => item.id === data.id) ? 'border-2 border-solid border-green-500' : ''
      }`}
    >
      <FormItemDraggable<JobImage & { type: 'image' }> item={{ ...data, type: 'image' }} onClick={handleClick}>
        <GalleryImage src={DataHelper.getUrlFile(data.url)} className="hover:scale-105" />
      </FormItemDraggable>
    </div>
  );
};

export default GalleryFileItem;
