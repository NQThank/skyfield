import { CommonHelper } from '@/utils/helpers';
import { IFilterItemMap, IFormItemMap } from '../types';
import { LocationTypeEnum, PriorityEnum, TemplateTypeEnum } from '../enums';

export const LocationTypes = CommonHelper.EnumToArrayObject(LocationTypeEnum);
export const TemplateTypes = CommonHelper.EnumToArrayObject(TemplateTypeEnum);
export const Priorities = CommonHelper.EnumToArrayObject(PriorityEnum);

export const FormItemMap: IFormItemMap = {
  text_area: {
    label: 'Textarea',
    icon: <i className="fa-lg fa-solid fa-text-size" />
  },
  photo_collection: {
    label: 'Photo Collection',
    icon: <i className="fa-lg fa-regular fa-image" />
  },
  option: {
    label: 'Option',
    icon: <i className="fa-lg fa-solid fa-rectangle-list" />
  },
  check_list: {
    label: 'Check List',
    icon: <i className="fa-lg fa-solid fa-square-check" />
  },
  checkin: {
    label: 'Check In',
    icon: <i className="fa-lg fa-solid fa-circle-check" />
  },
  date: {
    label: 'Date',
    icon: <i className="fa-lg fa-solid fa-calendar-days" />
  },
  photo: {
    label: 'Photo',
    icon: <i className="fa-lg fa-regular fa-image" />
  },
  pre_post_photo: {
    label: 'Pre Post Photo',
    icon: <i className="fa-lg fa-regular fa-image" />
  },
  inspection_photos_collection: {
    label: 'Inspection Photos Collection',
    icon: <i className="fa-lg fa-regular fa-image" />
  },
  punch_list_inspection_collection: {
    label: 'Punch List Inspection Collection',
    icon: <i className="fa-lg fa-regular fa-image" />
  }
};

export const FilterItemMap: IFilterItemMap = {
  all: {
    label: 'All',
    value: 'all',
    types: []
  },
  text: {
    label: 'Text',
    value: 'text',
    types: ['text_area', 'text']
  },
  numeric: {
    label: 'Numeric',
    value: 'numeric',
    types: []
  },
  list: {
    label: 'List',
    value: 'list',
    types: ['option', 'check_list']
  },
  date_time: {
    label: 'Date/Time',
    value: 'date_time',
    types: ['date']
  },
  image: {
    label: 'Image',
    value: 'image',
    types: ['photo_collection', 'photo', 'inspection_photos_collection', 'punch_list_inspection_collection']
  }
};
