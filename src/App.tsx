import React from 'react';
import { Up } from '@/blocks/Up';
import { Settings } from '@/blocks/Settings';
import { History } from '@/blocks/History';
import { useEffect, useState } from 'react';
import { useConfig } from '@/store';

import {
  Button,
  ConfigProvider,
  Menu,
  Radio,
  Select,
} from '@arco-design/web-react';
import {
  IconMoon,
  IconPushpin,
  IconSettings,
  IconSun,
  IconUpload,
} from '@arco-design/web-react/icon';
import { Link, RouterProvider, createBrowserRouter } from 'react-router-dom';

import './App.css';
import { useTop } from '@/hooks/useTop';
const RadioGroup = Radio.Group;

type Pages = 'Hisotry' | 'Up' | 'Settings';
const MenuItem = Menu.Item;

const Page = (props: React.PropsWithChildren<{}>) => {
  const config = useConfig();
  const [top, toggle] = useTop();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  useEffect(() => {
    if (theme === 'dark') {
      // 设置为暗黑主题
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      // 恢复亮色主题
      document.body.removeAttribute('arco-theme');
    }
  }, [theme]);

  const [route, setRoute] = useState<Pages>('Hisotry');

  return (
    <ConfigProvider>
      {/* <Titlebar></Titlebar> */}
      <div
        data-tauri-drag-region
        style={{
          display: 'flex',
          paddingTop: '16px',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingLeft: '80px',
        }}
      >
        <Menu
          style={{ width: '100%', flex: 1 }}
          mode="horizontal"
          selectedKeys={[route]}
          defaultSelectedKeys={['Hisotry']}
        >
          <Link to="/">
            <MenuItem onClick={() => setRoute('Hisotry')} key="Hisotry">
              <div
                style={{
                  width: '100px',
                  fontSize: '1.4rem',
                }}
              >
                🚀 Yap!
              </div>
            </MenuItem>
          </Link>
          <Link to="/up">
            <MenuItem onClick={() => setRoute('Up')} key="Up">
              <div>
                <IconUpload color="rgb(var(--arcoblue-6))"></IconUpload>
                上传
              </div>
            </MenuItem>
          </Link>
          <Link to="/settings">
            <MenuItem onClick={() => setRoute('Settings')} key="Settings">
              <div>
                <IconSettings color="rgb(var(--arcoblue-6))"></IconSettings>
                设置
              </div>
            </MenuItem>
          </Link>
        </Menu>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '260px',
              paddingRight: '16px',
            }}
          >
            <div>
              <Select
                style={{ width: '100px' }}
                onChange={(v) => {
                  config?.setCurrent(v);
                }}
                value={config?.current?.accessKeyId}
                options={config.list.map((item) => {
                  return {
                    label: item.alias,
                    value: item.accessKeyId,
                  };
                })}
              ></Select>
            </div>
            <div>
              <RadioGroup
                value={theme}
                onChange={(v) => setTheme(v)}
                type="button"
                defaultValue="light"
              >
                <Radio value="light">
                  <IconSun></IconSun>
                </Radio>
                <Radio value="dark">
                  <IconMoon></IconMoon>
                </Radio>
              </RadioGroup>
            </div>
            <div>
              <Button
                type={top ? 'primary' : 'outline'}
                icon={<IconPushpin></IconPushpin>}
                onClick={toggle}
                iconOnly
              ></Button>
            </div>
          </div>
        </div>
      </div>
      {props.children}
    </ConfigProvider>
  );
};
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Page>
        <History></History>
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
]);
const App = () => {
  return (
    <RouterProvider
      fallbackElement={
        <Page>
          <History></History>
        </Page>
      }
      router={router}
    ></RouterProvider>
  );
};

export default App;
