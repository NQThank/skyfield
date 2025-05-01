import { ExclamationCircleFilled } from '@ant-design/icons';
import { Modal, ModalFuncProps } from 'antd';

type ModalType = 'confirm' | 'info' | 'success' | 'error' | 'warning';

class ModalHelper {
  public static confirm(props: ModalFuncProps, type: ModalType = 'confirm') {
    return Modal[type]({
      icon: <ExclamationCircleFilled />,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      ...props
    });
  }
}

export default ModalHelper;
