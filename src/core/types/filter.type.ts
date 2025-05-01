import { SelectType } from './common.type';

export type FilterType = 'textbox' | 'select' | 'datepicker' | 'radio-group' | 'autocomplete' | 'date-range';

export type Filter = {
  label: string;
  name: string;
  type: FilterType;
} & (
  | {
      type: 'select' | 'radio-group';
      options?: SelectType<string | number>[];
    }
  | {
      type: 'textbox';
    }
  | { type: 'datepicker' }
  | { type: 'autocomplete' }
  | { type: 'date-range' }
);
