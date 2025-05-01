import { ParamsCommon } from './common.type';
import { Employee } from './employee.type';

export type Team = {
  id: string;
  name: string;
  pm_id: string;
  pm_name?: string;
  user: Employee;
};

export type TeamFilter = ParamsCommon & {
  q?: string;
};

export type TeamPayload = Pick<Team, 'name' | 'pm_id'>;
