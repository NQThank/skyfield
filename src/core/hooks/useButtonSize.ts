import type { SizeType } from 'antd/lib/config-provider/SizeContext';
import useScreen from './useScreen';

const useButtonSize = (): SizeType => {
  const { md } = useScreen();
  return md ? 'large' : 'middle';
};

export default useButtonSize;
