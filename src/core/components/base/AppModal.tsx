import { ModalBaseProps } from '@/core/types';
import { Modal, ModalProps } from 'antd';

type AppModalProps<T> = ModalProps & ModalBaseProps<T>;

function AppModal<T>({ onCancel, open, confirmLoading, okText, ...props }: AppModalProps<T>) {
  return (
    <Modal
      maskClosable={false}
      open={open}
      confirmLoading={confirmLoading}
      okText={confirmLoading ? 'Submitting' : okText}
      cancelButtonProps={{ type: 'text' }}
      onCancel={onCancel}
      {...props}
    />
  );
}

export default AppModal;
