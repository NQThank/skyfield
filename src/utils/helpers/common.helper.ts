import axios from 'axios';
import { ClassValue, clsx } from 'clsx';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { debounce, isNumber } from 'lodash';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

import i18n from '@/app/i18n';
import { ResponseCommon } from '@/core/types';

class CommonHelper {
  public static readonly phoneUtil = PhoneNumberUtil.getInstance();

  public static readonly debounceFn = (function (timeout = 1000) {
    return debounce(
      (value: string, fetchData: (value: string, filterName?: any) => void | Promise<void>, filterName?: any) =>
        fetchData(value, filterName),
      timeout
    );
  })();

  public static EnumToArrayObject(enumConvert: { [key: number | string]: string }) {
    return Object.keys(enumConvert).map((key) => {
      return {
        label: key,
        value: enumConvert[key as keyof typeof enumConvert]
      };
    });
  }

  public static handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errData = error.response.data;
        if (typeof errData === 'string') {
          toast.error(errData);
        } else if ('success' in errData) {
          const err = errData as ResponseCommon<null>;
          if (!err.success) {
            toast.error(err?.error?.message || i18n.t(['common:fail']));
          } else {
            toast.error(i18n.t(['common:fail']));
          }
        } else {
          const err = errData as Error;
          toast.error(err?.message || i18n.t(['common:fail']));
        }
      }
      // Do something with this error...
    } else if (error?.error) {
      toast.error(error.error?.message || i18n.t(['common:fail']));
    } else {
      toast.error(i18n.t(['common:fail']));
    }
  }

  public static cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }

  public static createRange<T>(length: number, initializer: (index: number) => T): T[] {
    return [...new Array(length)].map((_, index) => initializer(index));
  }

  public static generateStr() {
    return uuidv4();
  }

  public static fieldArrayToString(arr: (string | number)[]): string {
    let fieldNameString = '';
    arr.forEach((item) => {
      if (isNumber(item)) {
        fieldNameString += `[${item}].`;
      } else {
        fieldNameString += item;
      }
    });
    return fieldNameString;
  }
  public static withToastForError<Args, Returned>(payloadCreator: (args: Args) => Promise<Returned>) {
    return async (args: Args) => {
      try {
        return await payloadCreator(args);
      } catch (err) {
        this.handleError(err);
        throw err; // throw error so createAsyncThunk will dispatch '/rejected'-action
      }
    };
  }

  public static isValidPhoneNumber(phoneNumber: string, region = 'US') {
    try {
      const _phoneNumber = this.phoneUtil.parse(phoneNumber, region);
      return this.phoneUtil.isValidNumberForRegion(_phoneNumber, region);
    } catch (error) {
      return false;
    }
  }
}

export default CommonHelper;
