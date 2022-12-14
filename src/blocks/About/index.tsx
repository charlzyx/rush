import { autoupdate } from '@/autoupdate';
import { DB } from '@/db';
import { StatisticsItem } from '@/shared/typings';
import { Button, Statistic, Typography } from '@arco-design/web-react';
import { IconBug, IconGithub, IconQuestion } from '@arco-design/web-react/icon';
import { shell } from '@tauri-apps/api';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import './about.css';
const readable = (limit: number) => {
  var size = '';
  if (limit < 1 * 1024) {
    //小于1KB，则转化成B
    size = `${limit.toFixed(2)}Bytes`;
  } else if (limit < 1 * 1024 * 1024) {
    //小于1MB，则转化成KB
    size = `${(limit / 1024).toFixed(2)}KB`;
  } else if (limit < 1 * 1024 * 1024 * 1024) {
    //小于1GB，则转化成MB
    size = `${(limit / (1024 * 1024)).toFixed(2)}MB`;
  } else {
    //其他转化成GB
    size = `${(limit / (1024 * 1024 * 1024)).toFixed(2)}GB`;
  }
  var sizeStr = `${size}`; //转成字符串
  var index = sizeStr.indexOf('.'); //获取小数点处的索引
  var dou = sizeStr.slice(index + 1, 2); //获取小数点后两位的值
  if (dou === '00') {
    //判断后两位是否为00，如果是则删除00
    return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
  }
  return size;
};
const shield = (color: string) => {
  return `https://img.shields.io/github/v/release/charlzyx/rush?color=${encodeURI(
    color,
  )}&label=Rush%21&logoColor=rgb%2864%2C%20128%2C%20128%29&style=flat-square`;
};
const links = [
  {
    link: 'https://github.com/skyfish-qc/pngtiny',
    text: `[skyfish-qc/pngtiny](https://github.com/skyfish-qc/pngtiny)`,
  },
  {
    link: 'https://github.com/mxismean/image-tiny',
    text: `[mxismean/image-tiny](https://github.com/mxismean/image-tiny)`,
  },
  {
    link: 'https://pqina.nl/filepond/',
    text: `[filepond](https://pqina.nl/filepond/)`,
  },
  {
    link: 'https://github.com/Molunerfinn/PicGo',
    text: `[PicGo](https://github.com/Molunerfinn/PicGo)`,
  },
  {
    link: 'https://arco.design/react',
    text: `[arco.design](https://arco.design/react)`,
  },
  {
    link: 'https://github.com/mantou132/nesbox',
    text: `[mantou132/nesbox](https://github.com/mantou132/nesbox)`,
  },
];
const Link = (props: { link: string; children: string }) => {
  return (
    <span
      onClick={() => {
        shell.open(props.link);
      }}
      style={{
        cursor: 'pointer',
        color: 'var(--color-text-1)',
      }}
    >
      - {props.children}
    </span>
  );
};

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
      before,
      after,
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
          <img
            style={{
              cursor: 'pointer',
            }}
            onClick={() => {
              shell.open('https://github.com/charlzyx/rush');
            }}
            className="logo"
            src="/brand.svg"
            alt=""
          />
        </div>
        <div>
          <img
            onClick={() => {
              shell.open('https://github.com/charlzyx/rush/releases/latest');
            }}
            src={shield('rgba(105, 241, 198)')}
            alt="rush"
          />
          {/* <Button
            onClick={() => {
              shell.open('https://github.com/charlzyx/rush');
            }}
            size="large"
            type="text"
            icon={<IconGithub></IconGithub>}
          ></Button> */}
        </div>
      </div>
      <div className="body">
        <Title heading={4}>从 {counts.from} 至今, Rush 共计为你</Title>
        <div className="space">
          <Statistic value={`${counts.len} 张`} title="压缩图片"></Statistic>
          <Statistic
            value={`${readable(counts.before)}`}
            title="将图片大小从 "
          ></Statistic>
          <Statistic
            title="减少到"
            value={`${readable(counts.after)}`}
          ></Statistic>
          <Statistic title="存储空间" value={`-${counts.p}%`}></Statistic>
        </div>
        <div>
          <Title heading={5}># 致谢</Title>
          <div
            style={{
              // borderLeft: '6px solid var(--color-bg-1)',
              // paddingLeft: '8px',
              marginBottom: '8px',
              // backgroundColor: 'var(--color-bg-1)',
            }}
          >
            &gt; Rush 的诞生离不开以下这些开源项目
          </div>
          <div>
            {links.map((item) => {
              return (
                <div key={item.link}>
                  <Link key={item.link} link={item.link}>
                    {item.text}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="center">
        <Button
          onClick={() => {
            shell.open('https://github.com/charlzyx/rush/issues/new');
          }}
          icon={<IconBug></IconBug>}
          long
          type="text"
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
          type="text"
        >
          检查更新
        </Button>
      </div>
    </div>
  );
};
