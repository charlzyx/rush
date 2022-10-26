import React, { useEffect, useState } from 'react';
import { Progress, Radio, Space } from '@arco-design/web-react';
import {
  IconHistory,
  IconInfo,
  IconPrinter,
  IconSettings,
  IconUpload,
} from '@arco-design/web-react/icon';
import { useRoute } from '@/Route';
import { useProgress } from '@/Progress';

const RadioGroup = Radio.Group;

type PageNames = 'Hisotry' | 'Up' | 'Zip' | 'Settings' | 'About';

const nowToPageNames = (x: string) => {
  return x === '/'
    ? ('Zip' as PageNames)
    : (x.replace(/^\w/, (m) => m.toUpperCase()) as PageNames);
};

export const Menu = () => {
  const { to, now } = useRoute();
  const { zip, up } = useProgress();

  const [route, setRoute] = useState<PageNames>(nowToPageNames(now));

  useEffect(() => {
    switch (route) {
      case 'Zip':
        to('/');
        break;
      case 'Hisotry':
        to('history');
        break;
      case 'Settings':
        to('settings');
        break;
      case 'Up':
        to('up');
        break;
      case 'About':
        to('about');
        break;
      default:
        to('/');
        break;
    }
  }, [route, to]);

  return (
    <React.Fragment>
      <Space
        size="small"
        style={{
          marginRight: '8px',
        }}
      >
        <Progress size="small" steps={5} percent={zip}></Progress>
        <Progress
          size="small"
          steps={5}
          percent={up}
          color="rgb(var(--primary-6))"
        ></Progress>
      </Space>
      <RadioGroup
        style={{ width: '360px' }}
        value={route}
        type="button"
        // defaultValue={route}
      >
        <Radio onClick={() => setRoute('Zip')} value="Zip">
          <div>
            <IconPrinter color="rgb(var(--arcoblue-6))"></IconPrinter>
            压缩
          </div>
        </Radio>
        <Radio onClick={() => setRoute('Up')} value="Up">
          <div>
            <IconUpload color="rgb(var(--arcoblue-6))"></IconUpload>
            上传
          </div>
        </Radio>
        <Radio onClick={() => setRoute('Hisotry')} value="Hisotry">
          <div>
            <IconHistory color="rgb(var(--arcoblue-6))"></IconHistory>
            历史
          </div>
        </Radio>
        <Radio onClick={() => setRoute('Settings')} value="Settings">
          <div>
            <IconSettings color="rgb(var(--arcoblue-6))"></IconSettings>
            设置
          </div>
        </Radio>
        <Radio onClick={() => setRoute('About')} value="About">
          <div>
            <IconInfo color="rgb(var(--arcoblue-6))"></IconInfo>
            关于
          </div>
        </Radio>
      </RadioGroup>
    </React.Fragment>
  );
};
