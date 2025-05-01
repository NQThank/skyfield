import { RcFile } from 'antd/es/upload';

class FileHelper {
  public static downloadFile(data: any, fileName?: string, type?: string) {
    const fileURL = URL.createObjectURL(
      new Blob([data], {
        type: type ?? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
    );
    const fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.setAttribute('download', fileName ?? 'File');
    document.body.appendChild(fileLink);
    fileLink.click();
  }
  public static getBase64(img: RcFile, callback: (url: string) => void) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  }
}

export default FileHelper;
