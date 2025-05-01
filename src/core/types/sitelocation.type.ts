import { ParamsCommon } from './common.type';

export type Sitelocation = {
  id: string;
  name: string;
  address?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  structural_owner?: string;
  structural_code?: string;
  structural_name?: string;
  structural_type?: string;
  structural_height?: number;
  mount_cl?: number;
  antennas_cl?: number;
  access_info?: string;
};

export type SitelocationPayload = Omit<Sitelocation, 'id'>;

export type SitelocationSearch = {
  q?: string;
};

export type SitelocationFilter = SitelocationSearch & ParamsCommon;
