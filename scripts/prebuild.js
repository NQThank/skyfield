import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env
const result = dotenv.config({ path: '.env' });

if (result.error) {
  throw result.error;
}

// eslint-disable-next-line no-undef
const {
  REACT_APP_COLOR_HEADER_FROM,
  REACT_APP_COLOR_HEADER_TO,
  REACT_APP_COLOR_LOGIN_FROM,
  REACT_APP_COLOR_LOGIN_TO,
  REACT_APP_FAVICON
} = process.env; // Biến môi trường chứa giá trị màu mới

// ==== START CHANGE FAVICON ====
const indexPath = 'index.html';

const newFaviconSvgPath = REACT_APP_FAVICON;

// Đọc nội dung của tệp index.html
let indexContent = fs.readFileSync(indexPath, 'utf-8');

// Tìm vị trí của thẻ <link> chứa favicon trong index.html
const linkTagStart = indexContent.indexOf('<link rel="icon"');
const linkTagEnd = indexContent.indexOf('>', linkTagStart) + 1;

// Tạo thẻ <link> mới với đường dẫn favicon mới
const newLinkTag = `<link rel="icon" href="${newFaviconSvgPath}" type="image/svg+xml" />`;

// Thay thế thẻ <link> cũ bằng thẻ <link> mới
indexContent = indexContent.substring(0, linkTagStart) + newLinkTag + indexContent.substring(linkTagEnd);

// Ghi lại nội dung vào tệp index.html
fs.writeFileSync(indexPath, indexContent);

// ==== END CHANGE FAVICON ====

// Đọc và thay đổi tập tin cấu hình
const configPath = 'tailwind.config.js';

import config from '../tailwind.config.js';

// Thay đổi cấu hình màu sắc trong tailwind.config.js
config.theme.extend.colors = {
  ...config.theme.extend.colors,
  header: {
    from: REACT_APP_COLOR_HEADER_FROM,
    to: REACT_APP_COLOR_HEADER_TO
  },
  login: {
    from: REACT_APP_COLOR_LOGIN_FROM,
    to: REACT_APP_COLOR_LOGIN_TO
  }
};

// Chuyển cấu hình mới thành chuỗi JSON
const newConfigString = `
/** @type {import('tailwindcss').Config} */

export default ${JSON.stringify(config, null, 2)}
`;

// Ghi lại cấu hình mới vào tập tin
fs.writeFileSync(configPath, newConfigString, 'utf-8');
