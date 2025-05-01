import type { Breakpoint } from 'antd';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;
const useScreen = (): Partial<Record<Breakpoint, boolean>> => {
  return useBreakpoint();
};

export default useScreen;
