import dayjs from 'dayjs';
import { flatMap, values } from 'lodash';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

import { FormatDate, UploadFileResponse } from '@/core/types';
import LogHelper from './log.helper';
import CommonHelper from './common.helper';
import { DateFormat } from '@/core/enums';
class FormatHelper {
  public static phoneUtil = PhoneNumberUtil.getInstance();

  public static formatDate(date: string, formatTo: FormatDate = 'DD/MM/YYYY', formatFrom?: string) {
    if (!date) return '';
    let dateMoment: dayjs.Dayjs;
    if (!formatFrom) {
      dateMoment = dayjs(date);
    } else {
      dateMoment = dayjs(date, formatFrom);
    }
    return dateMoment.isValid() ? dateMoment.format(formatTo) : '';
  }

  public static tryParseJson(str: string) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return {};
    }
  }

  public static getFileIds(data: UploadFileResponse) {
    return flatMap(data, (obj) => values(obj)) ?? [];
  }

  public static getUUIDFromPathFile(path: string) {
    const splitPath = path.split('=');
    return splitPath?.[1];
  }

  public static formatPhoneNumber(
    phoneNumber: string,
    region = 'US',
    phoneNumberFormat = PhoneNumberFormat.NATIONAL
  ): string {
    try {
      const phonenumber = this.phoneUtil.parse(phoneNumber, region);
      if (CommonHelper.isValidPhoneNumber(phoneNumber)) {
        return this.phoneUtil.format(phonenumber, phoneNumberFormat);
      }
      return phoneNumber;
    } catch (error) {
      LogHelper.logError(error);
      return phoneNumber;
    }
  }

  public static parseBookingToEvent(data: any[]): any[] {
    if (!data) return [];

    return data.map(({ id, end_date, customer_name, status, team_name, scope_of_work, name }) => ({
      id,
      start: new Date(dayjs(end_date).format()),
      end: new Date(dayjs(end_date).format()),
      title: name,
      customer_name: customer_name,
      status,
      team_name,
      scope_of_work,
      time: `${dayjs(end_date).format(DateFormat['DD/MM/YYYYHHmm'])} - ${dayjs(end_date).format(
        DateFormat['DD/MM/YYYYHHmm']
      )}`
    }));
  }

  // public static parseBookingToEvent(data: any[]): any[] {
  //   if (!data) return [];
  //   console.log('data', data);

  //   return data.map(({ id, end_date, customer_name, status }) => ({
  //     id,

  //     title: customer_name,
  //     status,
  //     time: `${dayjs(end_date).format(DateFormat['DD/MM/YYYYHHmm'])} - ${dayjs(end_date).format(
  //       DateFormat['DD/MM/YYYYHHmm']
  //     )}`
  //   }));
  // }
}

export default FormatHelper;
