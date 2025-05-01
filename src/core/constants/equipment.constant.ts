import { EquipmentType, SelectType } from '../types';

export const EquipmentTypes: SelectType<EquipmentType>[] = [
  {
    label: 'Bill of material',
    value: 'bill_of_material'
  },
  {
    label: 'Carrier bom',
    value: 'carrier_bom'
  },
  {
    label: 'Rf bom',
    value: 'rf_bom'
  },
  {
    label: 'Rf bom assets',
    value: 'rf_bom_assets'
  },
  {
    label: 'Steel bom',
    value: 'steel_bom'
  }
];
