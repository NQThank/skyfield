import { Affix, Card, Empty } from 'antd';
import clsx from 'clsx';
import { isEmpty } from 'lodash';
import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useBreakPoint } from '@/core/hooks';
import { useJobTask } from '@/store';
import GalleryFileItem from './GalleryFileItem';
import ImageSkeleton from './ImageSkeleton';

type GalleryFileProps = {};

const GalleryFile: React.FC<GalleryFileProps> = () => {
  const { galleryImages, loadingJobTask, fetchJobImages, imagesJobSubTaskItemMap } = useJobTask();

  const { xl } = useBreakPoint();

  const { jobId } = useParams();
  const listImageUploaded = useMemo(
    () =>
      (Object.values(imagesJobSubTaskItemMap).flat() || [])
        .filter((item) => item.status === 'UPLOADED')
        .map((item) => item.id),
    [imagesJobSubTaskItemMap]
  );
  const listImageValid = useMemo(
    () => galleryImages.filter((item) => !listImageUploaded.includes(item.id)),
    [galleryImages, listImageUploaded]
  );
  useEffect(() => {
    if (!jobId) return;
    fetchJobImages(jobId);
  }, [fetchJobImages, jobId]);

  const _buildImages = useMemo(
    () => (
      <Card title="Job Files Gallery">
        <div
          className={clsx('flex flex-wrap gap-4', {
            'justify-center': isEmpty(listImageValid) && !loadingJobTask['job-image']
          })}
        >
          {loadingJobTask['job-image'] && <ImageSkeleton count={6} />}
          {!loadingJobTask['job-image'] &&
            !isEmpty(listImageValid) &&
            listImageValid.map((item) => item.status === 'UPLOADED' && <GalleryFileItem data={item} key={item.id} />)}
          {!loadingJobTask['job-image'] && isEmpty(listImageValid) && <Empty />}
        </div>
      </Card>
    ),
    [listImageValid, loadingJobTask]
  );
  return xl ? (
    <Affix offsetTop={0} target={() => document.querySelector('.default-layout__content') as HTMLElement}>
      {_buildImages}
    </Affix>
  ) : (
    _buildImages
  );
};

export default GalleryFile;
