import { Modal, ModalProps } from 'antd';
import clsx from 'clsx';
import React, { useCallback, useState } from 'react';

type ConfirmModalProps = ModalProps & {
  onConfirm?: (callback: () => void) => void | Promise<void>;
  onValidate?: () => boolean;
  description?: string;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  onCancel,
  onConfirm,
  description,
  cancelButtonProps,
  okButtonProps,
  onValidate,
  ...props
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);

  const callback = useCallback(() => {
    setConfirmLoading(false);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    onCancel?.();
  }, [onCancel]);

  const handleAction = () => {
    setConfirmLoading(true);
    let isValid = true;
    if (onValidate) {
      isValid = onValidate();
    }

    if (!isValid) return setConfirmLoading(false);
    onConfirm?.(callback);
  };

  const afterClose = () => {
    setConfirmLoading(false);
  };
  return (
    <Modal
      width={500}
      afterClose={afterClose}
      onOk={handleAction}
      onCancel={onCancel}
      cancelButtonProps={{ disabled: confirmLoading, ...cancelButtonProps }}
      okButtonProps={{ loading: confirmLoading, ...okButtonProps }}
      closable={false}
      maskClosable={false}
      {...props}
    >
      <h2 className={clsx('text-base font-semibold', props.children ? 'mb-4' : 'mb-8')}>
        {description ?? 'Are you sure?'}
      </h2>
      {props.children}
    </Modal>
  );
};

export default ConfirmModal;
