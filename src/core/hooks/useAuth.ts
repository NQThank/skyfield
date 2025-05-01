import jwtDecode from 'jwt-decode';

import useAppSelector from './useAppSelector';
import { UserType } from '../types';

type Auth = {
  first_name: string;
  last_name: string;
  ut: UserType;
};

const useAuth = (): Auth | null => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user?.token) return null;
  const decoded: Auth = jwtDecode(user.token);
  return decoded;
};

export default useAuth;
