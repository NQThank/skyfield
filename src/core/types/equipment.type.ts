import { ParamsCommon } from './common.type';

export type EquipmentType = 'rf_bom' | 'rf_bom_assets' | 'bill_of_material' | 'steel_bom' | 'carrier_bom';

export type Equipment = {
  id: string;
  name: string;
  type: EquipmentType;
  manufacturer?: string;
  model?: string;
  part_number?: string;
  weight?: number;
  height?: number;
  width?: number;
  depth?: number;
  details?: string;
  uom?: string;
  category?: string;
  price?: number;
  sku?: string;
  quantity?: number;
};

export type EquipmentPayload = Omit<Equipment, 'id'>;

export type EquipmentSearch = {
  q?: string;
};

export type EquipmentFilter = EquipmentSearch & ParamsCommon;
