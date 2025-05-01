import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer, ToastContainerProps } from 'react-toastify';
import * as yup from 'yup';
import { Toaster } from 'sonner';

import '@/app/i18n';
import App from './App';
import store from './app/store';
import { yupLocale } from './core/configs';

import enUs from 'antd/locale/en_US';
import '@/styles/app.scss';

import 'dayjs/locale/en';
import dayjs from 'dayjs';

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

yup.setLocale(yupLocale);

yup.addMethod(yup.object, 'dayjs', function method(message) {
  return this.test('dayjs', message, function validate(value) {
    if (!value) {
      return true;
    }
    return dayjs.isDayjs(value);
  });
});

const toastConfig: ToastContainerProps = {
  position: 'top-center',
  autoClose: 2000,
  hideProgressBar: true,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: 'light'
};

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);
root.render(
  <BrowserRouter>
    <ConfigProvider
      locale={enUs}
      theme={{
        components: {
          Typography: {
            margin: 0
          },
          Layout: {
            siderBg: '#2E3E52'
          },
          Menu: {
            darkItemSelectedBg: '#34444C',
            darkItemSelectedColor: '#ffffff',
            darkItemColor: '#B8BEC1',
            darkItemBg: '	#2e3e52',
            darkItemHoverBg: '#314048',
            darkSubMenuItemBg: '	#2e3e52'
          }
        },
        token: {
          fontFamily:
            "'CircularStd', 'Open Sans', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans','Helvetica Neue', sans-serif",
          borderRadius: 5
        }
      }}
    >
      <StyleProvider hashPriority="high">
        <Provider store={store}>
          <App />
          <ToastContainer {...toastConfig} />
          <Toaster richColors position="bottom-left" />
        </Provider>
      </StyleProvider>
    </ConfigProvider>
  </BrowserRouter>
);
