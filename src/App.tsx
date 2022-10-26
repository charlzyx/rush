import { Header } from '@/blocks/Header';
import { History } from '@/blocks/History';
import { Settings } from '@/blocks/Settings';
import { About } from '@/blocks/About';
import { Up } from '@/blocks/Up';
import { Zip } from '@/blocks/Zip';
import React, { useEffect } from 'react';
import { KeepPage, RouteProvider, useRoute } from './Route';
import { ProgressProvider } from './Progress';

import { ConfigProvider } from '@arco-design/web-react';
import './App.css';

const WithRoute = (props: React.PropsWithChildren<{}>) => {
  const route = useRoute();
  return (
    <React.Fragment>
      <ConfigProvider>
        <div
          style={{
            height: '100%',
            display: 'flex',
            overflow: 'hidden',
            flexDirection: 'column',
          }}
        >
          <div>
            <Header></Header>
          </div>
          <div style={{ flex: 1, height: '100%' }}>
            <KeepPage key="/" show={route.is('/')}>
              <Zip></Zip>
            </KeepPage>
            <KeepPage key="up" show={route.is('up')}>
              <Up></Up>
            </KeepPage>
            <KeepPage key="history" show={route.is('history')}>
              <History></History>
            </KeepPage>
            <KeepPage key="settings" show={route.is('settings')}>
              <Settings></Settings>
            </KeepPage>
            <KeepPage key="about" show={route.is('about')}>
              <About></About>
            </KeepPage>
          </div>
        </div>
      </ConfigProvider>
    </React.Fragment>
  );
};

const App = () => {
  useEffect(() => {
    // 防止拖一个图片进来, 被浏览器打开了
    window.addEventListener('drop', (e) => {
      e.stopPropagation();
      e.preventDefault();
    });
    window.addEventListener('dragover', (e) => {
      e.stopPropagation();
      e.preventDefault();
    });
  }, []);

  return (
    <RouteProvider>
      <ProgressProvider>
        <WithRoute></WithRoute>
      </ProgressProvider>
    </RouteProvider>
  );
};

export default App;
