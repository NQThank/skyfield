import React, { useCallback, useEffect, useState } from 'react';
import { JobService } from '@/core/services';
import fileService from '@/core/services/file.service';
import jobService from '@/core/services/job.service';
import { DataHelper } from '@/utils/helpers';
import { UploadOutlined } from '@ant-design/icons';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Col, Empty, Image, Row, Upload, message } from 'antd';
import { UploadProps } from 'antd/lib';
import { useParams } from 'react-router-dom';
import { JobImage } from '@/core/types';

const PhotoGallery: React.FC = () => {
  const { id } = useParams();

  const [galleryImages, _setGalleryImages] = useState<string[]>([]);
  const [approvedImages, _setApprovedImages] = useState<string[]>([]);
  const [rejectedImages, _setRejectedImages] = useState<string[]>([]);

  const props: UploadProps = {
    name: 'file',
    headers: {
      authorization: 'authorization-text'
    },
    accept: '.png,.jpg,.jpeg',
    showUploadList: false,
    multiple: true,
    async onChange(info) {
      if (info.file.status !== 'uploading') {
        try {
          const formData = new FormData();
          formData.append('files', info.file.originFileObj as Blob);
          const res = await fileService.uploadFile(formData);
          if (res.success && res.data && id) {
            const resTemps = Object.values(res.data[0])[0];
            const result = await JobService.updateGalleryById(id, resTemps);
            if (result.success) {
              fetchImages();
            }
          }
        } catch (error) {
          console.log(error);
          message.error('Upload failed');
        }
      }
    }
  };

  const fetchImages = useCallback(async () => {
    try {
      if (id) {
        const res = await jobService.getGalleryById(id, { page_number: 1, page_size: 20 });
        if (res.success && res.data) {
          const uploadedImages = res.data
            .filter((item: JobImage) => item.status === 'UPLOADED')
            .map((item: JobImage) => item.url);
          const approvedImages = res.data
            .filter((item: JobImage) => (item.status as any) === 'APPROVE')
            .map((item: JobImage) => item.url);
          const rejectedImages = res.data
            .filter((item: JobImage) => (item.status as any) === 'REJECT')
            .map((item: JobImage) => item.url);
          _setGalleryImages(uploadedImages);
          _setApprovedImages(approvedImages);
          _setRejectedImages(rejectedImages);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  useEffect(() => {
    fetchImages();
  }, [id, fetchImages]);
  return (
    <div className="px-4">
      <h2 className="flex w-full justify-between py-4">
        <h4>Photo upload </h4>
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>Add new image</Button>
        </Upload>
      </h2>

      <Row gutter={[0, 24]} className="m-auto w-full rounded bg-white py-8 shadow-md">
        {galleryImages.length ? (
          galleryImages.map((img) => (
            <Col key={img} xxl={4} xl={6} className="flex justify-center ">
              <Image
                className="rounded shadow-md"
                src={`${DataHelper.getUrlFile(img)}`}
                preview
                width={120}
                height={120}
              />
            </Col>
          ))
        ) : (
          <Empty className="m-auto" />
        )}
      </Row>
      <Row className="m-auto mt-10 w-full rounded-lg bg-white p-0 shadow-md">
        <Col span={12}>
          <Row className="">
            <Col
              span={24}
              className="border-b-2 py-4 text-center text-lg font-bold"
              style={{ borderBottom: '1px solid #ccc', borderRight: '1px solid #ccc' }}
            >
              Approved
            </Col>
            {approvedImages.length ? (
              approvedImages.map((img) => (
                <Col key={img} xxl={8} xl={12} className="p-4">
                  <Card className="relative flex h-36 items-center justify-center bg-gray-200 shadow-md">
                    <Image
                      className="rounded shadow-md"
                      src={`${DataHelper.getUrlFile(img)}`}
                      preview
                      width={100}
                      height={100}
                    />
                    <FontAwesomeIcon icon={faCheck} className="absolute bottom-1 right-1 text-green-600" />
                  </Card>
                </Col>
              ))
            ) : (
              <Empty className="m-auto" />
            )}
          </Row>
        </Col>
        <Col span={12}>
          <Row className="">
            <Col
              span={24}
              className="border-b-2 py-4 text-center text-lg font-bold"
              style={{ borderBottom: '1px solid #ccc' }}
            >
              Rejected
            </Col>
            {rejectedImages.length ? (
              rejectedImages.map((img) => (
                <Col key={img} span={8} className="p-4 ">
                  <Card className="relative flex h-36 items-center justify-center bg-gray-200 shadow-md">
                    <Image
                      className="rounded shadow-md"
                      src={`${DataHelper.getUrlFile(img)}`}
                      preview
                      width={100}
                      height={100}
                    />
                    <FontAwesomeIcon icon={faXmark} className="absolute bottom-1 right-1 text-red-600" />
                  </Card>
                </Col>
              ))
            ) : (
              <Empty className="m-auto" />
            )}
          </Row>
        </Col>
      </Row>
      <Col span={24}></Col>
    </div>
  );
};

export default PhotoGallery;
