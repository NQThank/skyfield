import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { EmployeeProfile } from '@/core/components';
import { APP_NAME } from '@/core/constants';
import { PathLabelEnum } from '@/core/enums';
import { useAppDispatch } from '@/core/hooks';
import { EmployeeService } from '@/core/services';
import { Employee } from '@/core/types';
import { setNameMap } from '../../common.slice';
type Props = {
  id?: string;
};
const EmployeeDetailPage = ({ id }: Props) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Employee>();

  useEffect(() => {
    const fetchEmployeeById = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await EmployeeService.getEmployeeById(id);
        if (res.success) {
          setData(res.data);
          dispatch(setNameMap({ [id]: res.data?.full_name ?? '' }));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeById();
  }, [id, dispatch]);

  return (
    <>
      <Helmet>
        <title>{`${APP_NAME} - ${PathLabelEnum['employees-detail']}`}</title>
      </Helmet>

      <EmployeeProfile data={data} loading={loading} />
    </>
  );
};

export default EmployeeDetailPage;
