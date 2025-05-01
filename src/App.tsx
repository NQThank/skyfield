import { ConfigProvider } from 'antd';
import { Locale } from 'antd/es/locale';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PathURL from './core/class/PathURL';
import { useAppSelector } from './core/hooks';
import Router from './routes';

import enUS from 'antd/locale/en_US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './fontAwesomeConfig';

import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(weekday);
dayjs.extend(customParseFormat);

function App() {
  const navigate = useNavigate();
  const [locale] = useState<Locale>(enUS);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate(PathURL.login);
    }
  }, [user, navigate]);

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        token: { colorPrimary: process.env.REACT_APP_COLOR_PRIMARY },
        components: {
          Button: {
            colorPrimary: process.env.REACT_APP_BUTTON_COLOR_PRIMARY,
            algorithm: true,
            primaryShadow: 'none'
          },
          Switch: {
            colorPrimary: process.env.REACT_APP_BUTTON_COLOR_PRIMARY,
            algorithm: true
          }
        }
      }}
    >
      <div className="app overflow-hidden">
        <Router />
      </div>
    </ConfigProvider>
  );
}

export default App;
