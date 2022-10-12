import { Header } from '@/blocks/Header';
import { History } from '@/blocks/History';
import { Settings } from '@/blocks/Settings';
import { Up } from '@/blocks/Up';
import { Zip } from '@/blocks/Zip';
import React, { useEffect } from 'react';

import { ConfigProvider } from '@arco-design/web-react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import './App.css';

const Page = (props: React.PropsWithChildren<{}>) => {
  return (
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
        <div style={{ flex: 1, height: '100%' }}>{props.children}</div>
      </div>
    </ConfigProvider>
  );
};
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Page>
        <Zip></Zip>
      </Page>
    ),
  },
  {
    path: '/hisotry',
    element: (
      <Page>
        <History></History>
      </Page>
    ),
  },
  {
    path: '/settings',
    element: (
      <Page>
        <Settings></Settings>
      </Page>
    ),
  },
  {
    path: '/up',
    element: (
      <Page>
        <Up></Up>
      </Page>
    ),
  },
  {
    path: '/zip',
    element: (
      <Page>
        <Zip></Zip>
      </Page>
    ),
  },
]);
const App = () => {
  useEffect(() => {
    // 防止拖一个图片进来, 被浏览器打开了
    window.addEventListener('drop', (e) => {
      e.preventDefault();
    });
  }, []);
  return (
    <RouterProvider
      fallbackElement={
        <Page>
          <Zip></Zip>
        </Page>
      }
      router={router}
    ></RouterProvider>
  );
};

export default App;
