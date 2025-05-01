import useAuth from './useAuth';

type RoleOut = {
  isAdmin: boolean;
  isEmployee: boolean;
  isPM: boolean;
};

const useRole = (): RoleOut => {
  const auth = useAuth();
  if (!auth) return { isAdmin: false, isEmployee: false, isPM: false };
  const { ut } = auth;
  return { isAdmin: ut === 'admin', isEmployee: ut === 'employee', isPM: ut === 'pm' };
};

export default useRole;
