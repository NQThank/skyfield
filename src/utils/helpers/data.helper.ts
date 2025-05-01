import { CURRENT_ENV } from '@/core/configs';

class DataHelper {
  public static isEmpty(obj: object) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }

    return true;
  }

  public static filterOption(input: string, option: any) {
    return (option?.children ?? '').toLowerCase().includes(input.toLowerCase());
  }

  public static getEnumKeyByValue<T, K extends object>(value: T, enums: K) {
    const indexOfS = Object.values(enums).indexOf(value as unknown as K);

    const key = Object.keys(enums)[indexOfS];

    return key;
  }

  public static getUrlFile(path: string) {
    if (path.includes('/files/image/')) return `${CURRENT_ENV.API_URL}${path}`;
    else return `${CURRENT_ENV.API_URL}/files/image/${path}`;
  }
}

export default DataHelper;
