import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './reset.css';
import '@arco-design/web-react/dist/css/index.less';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import zh_cn from 'dayjs/locale/zh-cn';
import { DB } from '@/db';

console.log('DB connecting...');
DB.connect().then(() => {
  console.log('DB init...');
  DB.init().then(() => {
    console.log('DB inited.');
  });
});

dayjs.extend(relativeTime);

dayjs.locale(zh_cn);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
