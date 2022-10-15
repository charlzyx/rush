import { autoupdate } from '@/autoupdate';
import { DB } from '@/db';
import { StatisticsItem } from '@/shared/typings';
import { Button, Statistic, Typography } from '@arco-design/web-react';
import { IconBug, IconGithub, IconQuestion } from '@arco-design/web-react/icon';
import { shell } from '@tauri-apps/api';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import './about.css';

const { Title } = Typography;
export const About = () => {
  const [loading, setLoaing] = useState(false);

  const [list, setList] = useState<StatisticsItem[]>([]);

  const counts = useMemo(() => {
    const firstTime = list[0]
      ? dayjs(list[0].create_time).format('YYYY-MM-DD')
      : null;
    const before = list.reduce((c, i) => c + i.before, 0);
    const after = list.reduce((c, i) => c + i.after, 0);

    return {
      from: firstTime,
      len: list.length,
      before: (before / 1024).toFixed(2),
      after: (after / 1024).toFixed(2),
      p: (((before - after) / before) * 100).toFixed(2),
    };
  }, [list]);

  useEffect(() => {
    DB.count().then((res) => {
      setList(res);
    });
  }, []);

  return (
    <div className="about">
      <div className="space">
        <div>
          <img className="logo" src="/brand.svg" alt="" />
        </div>
        <div>
          <Button
            onClick={() => {
              shell.open('https://github.com/charlzyx/rush');
            }}
            type="text"
            icon={<IconGithub></IconGithub>}
          ></Button>
        </div>
      </div>
      <div className="body">
        <Title heading={4}>从 {counts.from} 至今, Rush 共计为你</Title>
        <div className="space">
          <Statistic value={`${counts.len} 张`} title="压缩图片"></Statistic>
          <Statistic
            value={`${counts.before} Kb`}
            title="将图片大小从 "
          ></Statistic>
          <Statistic title="减少到" value={`${counts.after} Kb`}></Statistic>
          <Statistic title="存储空间" value={`-${counts.p}%`}></Statistic>
        </div>
      </div>
      <div className="center">
        <Button
          onClick={() => {
            shell.open('https://github.com/charlzyx/rush/issues/new');
          }}
          icon={<IconBug></IconBug>}
          long
          type="default"
        >
          上报问题
        </Button>
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
        <Button
          loading={loading}
          onClick={async () => {
            setLoaing(true);
            try {
              await autoupdate();
            } catch (error) {
            } finally {
              setLoaing(false);
            }
          }}
          icon={<IconQuestion></IconQuestion>}
          long
          type="primary"
        >
          检查更新
        </Button>
      </div>
    </div>
  );
};
