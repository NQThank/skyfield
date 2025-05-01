import { ConfigProvider, Drawer, DrawerProps, Flex, Input, Tabs, TabsProps, Timeline, TimelineProps } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DateFormat } from '@/core/enums';
import { JobService, JobTaskService } from '@/core/services';
import { InfoItem, TComment } from '@/core/types';
import { useJobTask } from '@/store';
import AppButton from '../../base/AppButton';
import ConfirmModal from '../../shared/ConfirmModal';
import ViewInfos from '../../shared/ViewInfos';
import GalleryImage from './GalleryImage';

// import data from '@/data/job-task.json';
import { DataHelper } from '@/utils/helpers';
import ImageStatus from './ImageStatus';

type SubTaskItemImageDrawerProps = DrawerProps;

const SubTaskItemImageDrawer: React.FC<SubTaskItemImageDrawerProps> = ({ ...props }) => {
  const { imageSubTaskItemActive } = useJobTask();
  const items = useMemo<TabsProps['items']>(
    () => [
      { key: 'image', label: 'Image', icon: <i className="fa-regular fa-image" />, children: <SubTaskImageAction /> },
      // {
      //   key: 'exif',
      //   label: 'EXIF Detail',
      //   icon: <i className="fa-regular fa-image" />,
      //   children: <SubTaskImageDetail />
      // },
      // {
      //   key: 'instructions',
      //   label: 'Instructions',
      //   icon: <i className="fa-solid fa-chalkboard-user" />,
      //   children: <div></div>
      // },
      {
        key: 'comment',
        label: 'Comments',
        icon: <i className="fa-solid fa-comment" />,
        children: <SubTaskImageComments />
      }
    ],
    []
  );

  return (
    <Drawer closable={false} width={550} destroyOnClose {...props}>
      <Tabs
        items={items}
        tabBarExtraContent={{ right: <ImageStatus status={imageSubTaskItemActive?.status ?? 'UPLOADED'} /> }}
      />
    </Drawer>
  );
};

export default SubTaskItemImageDrawer;

const SubTaskImageAction = () => {
  const { imageSubTaskItemActive, updateImagesJobSubTaskItem, setImageSubTaskItemActive, setIsUpdateTask } =
    useJobTask();
  const [openModal, setOpenModal] = useState(false);
  const [reason, setReason] = useState('');
  const [errorText, setErrorText] = useState('');
  const [modalType, setModalType] = useState<'approve' | 'reject'>();

  const needReason = useMemo(
    () => modalType === 'reject' || imageSubTaskItemActive?.status !== 'UPLOADED',
    [modalType, imageSubTaskItemActive?.status]
  );

  // const handleOpenConfirmApprove = () => {
  //   setOpenModal(true);
  //   setModalType('approve');
  // };

  const handleOpenConfirmReject = () => {
    setOpenModal(true);
    setModalType('reject');
  };

  const handleConfirm = async (modalType: string) => {
    if (!imageSubTaskItemActive) return;
    // setTimeout(async () => {
    try {
      const updateStatus = modalType === 'approve' ? 'APPROVE' : 'REJECT';
      const payload = {
        status: updateStatus,
        reject_reason: reason ?? undefined
      };

      await JobTaskService.updateImageSubTaskItemById(
        imageSubTaskItemActive.job_id!,
        imageSubTaskItemActive.job_items_id!,
        imageSubTaskItemActive.id,
        payload
      );
      setIsUpdateTask(true);
      if (imageSubTaskItemActive.job_items_id) {
        updateImagesJobSubTaskItem(
          imageSubTaskItemActive.job_items_id,
          [{ ...imageSubTaskItemActive, status: updateStatus }],
          'update'
        );
      }
      setImageSubTaskItemActive({ ...imageSubTaskItemActive, status: updateStatus });
      if (modalType === 'approve') {
        toast.success('Approve image successfully!');
      } else {
        setOpenModal(false);
        toast.success('Reject image successfully!');
      }
    } catch {
      toast.error("Can't update image status");
    } finally {
      // callback();
    }
    //   callback();
    // }, 1000);
  };

  const handleUpdateReason = (text: string) => {
    setReason(text);
    if (text) {
      setErrorText('');
    } else {
      setErrorText('Please enter reason');
    }
  };

  const handleCancel = () => {
    setOpenModal(false);
    setErrorText('');
  };

  const handleValidate = () => {
    if (!needReason) return true;
    if (!reason) {
      setErrorText('Please enter reason');
      return false;
    }
    return true;
  };
  if (!imageSubTaskItemActive) return null;
  return (
    <>
      <div className="flex flex-col items-center gap-y-4">
        <GalleryImage
          src={DataHelper.getUrlFile(imageSubTaskItemActive.url)}
          className="h-full max-h-[50vh] w-full"
          preview
        />
        <Flex gap={8}>
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  colorPrimary: '#009E0F'
                }
              }
            }}
          >
            {imageSubTaskItemActive.status !== 'APPROVE' && (
              <AppButton type="primary" size="large" onClick={() => handleConfirm('approve')}>
                Approve
              </AppButton>
            )}
            {imageSubTaskItemActive.status === 'UPLOADED' && (
              <AppButton type="primary" danger size="large" onClick={handleOpenConfirmReject}>
                Reject
              </AppButton>
            )}
          </ConfigProvider>
        </Flex>
      </div>
      <ConfirmModal
        open={openModal}
        description={
          modalType === 'approve'
            ? 'Are you sure you want to approve this photo?'
            : 'Enter the reason you want to reject this photo'
        }
        onConfirm={() => handleConfirm('reject')}
        okButtonProps={{ danger: modalType === 'reject' }}
        okText={modalType === 'approve' ? 'Approve' : 'Reject'}
        onCancel={handleCancel}
        onValidate={handleValidate}
      >
        {needReason ? (
          <Input.TextArea
            placeholder="Enter reason"
            value={reason}
            status={errorText ? 'error' : ''}
            onChange={(e) => handleUpdateReason(e.target.value)}
          />
        ) : null}

        <span className="text-red-500">{errorText}</span>
      </ConfirmModal>
    </>
  );
};

const _SubTaskImageDetail = () => {
  const infos = useMemo<InfoItem<any>[]>(
    () => [
      {
        label: 'Image Type',
        dataIndex: 'image_type',
        render() {
          return 'JPG';
        },
        size: {
          span: 24
        }
      },
      {
        label: 'Revolution',
        dataIndex: 'revolution',
        render() {
          return '1200x640';
        },
        size: {
          span: 24
        }
      },
      {
        label: 'Lat/Long',
        dataIndex: 'lat_long',
        render() {
          return '27.98838,40.9237873';
        },
        size: {
          span: 24
        }
      },
      {
        label: 'Address',
        dataIndex: 'address',
        render() {
          return '2605 Woodberry Dr, Nashville,TN 37214, USA';
        },
        size: {
          span: 24
        }
      },
      {
        label: 'Captured',
        dataIndex: 'captured',
        render() {
          return '12/04/2024 Monday 8:34 AMCST';
        },
        size: {
          span: 24
        }
      },
      {
        label: 'Image size',
        dataIndex: 'size',
        render() {
          return '1400Kb';
        },
        size: {
          span: 24
        }
      }
    ],
    []
  );
  return <ViewInfos items={infos} />;
};
// const comments: TComment[] = data.comments as TComment[];
const SubTaskImageComments = () => {
  const { imageSubTaskItemActive } = useJobTask();

  const [data, setData] = useState<TComment[]>([]);
  useEffect(() => {
    const fetchComments = async () => {
      if (!imageSubTaskItemActive) return;
      try {
        const res = await JobService.getCommentTask(
          imageSubTaskItemActive.job_id ?? '',
          imageSubTaskItemActive.job_items_id ?? '',
          imageSubTaskItemActive.id
        );
        setData(res.data ?? []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchComments();
  }, [imageSubTaskItemActive]);

  const items = useMemo<TimelineProps['items']>(
    () =>
      data.map((item) => ({
        color: item.action === 'APPROVE' ? 'green' : 'red',
        children: <SubTaskImageComment data={item} />
      })),
    [data]
  );

  return <Timeline items={items} />;
};

type SubTaskImageCommentProps = {
  data: TComment;
};
const SubTaskImageComment: React.FC<SubTaskImageCommentProps> = ({ data }) => {
  const time = useMemo(() => dayjs(data.created_at).format(DateFormat['ddddDD/MM/YYYYHHmm']), [data.created_at]);
  return (
    <div className="flex flex-col">
      <div>
        <b>{data.user_name}</b> {data.action} at <span className="font-light text-blue-400">{time}</span>
      </div>
      {data.comment}
    </div>
  );
};
