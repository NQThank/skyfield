import { ParamsCommon } from './common.type';

export type Market = {
  id: string;
  name: string;
  wireless_carrier?: string;
  carrier_address?: string;
  carrier_logistic_location?: string;
  notes?: string;
};

export type MarketPayload = Omit<Market, 'id'>;

export type MarketSearch = {
  q?: string;
};

export type MarketFilter = ParamsCommon & MarketSearch;
