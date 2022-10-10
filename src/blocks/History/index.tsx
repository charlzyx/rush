import { useConfig } from '@/store';
import { useClient } from '@/utils/uploader';
import {
  Button,
  Card,
  Grid,
  Image,
  Message,
  Space,
  Typography,
} from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCopy,
  IconLink,
  IconRefresh,
} from '@arco-design/web-react/icon';
import { useSize } from 'ahooks';
import dayjs from 'dayjs';
import copy from '@arco-design/web-react/es/_util/clipboard';
import OSS from 'ali-oss';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePageLink } from './usePageLink';
import { AniSvg } from '@/blocks/AniSvg';

const Row = Grid.Row;
const Col = Grid.Col;

const Copyable = (props: { text: string }) => {
  return (
    <Button
      style={{
        width: '100%',
      }}
      onClick={() =>
        copy(props.text).then(() => {
          Message.success(`已复制到剪切板 ${props.text}`);
        })
      }
      size="small"
      icon={<IconLink></IconLink>}
      type="outline"
    >
      <IconCopy></IconCopy>
    </Button>
  );
};

const IMAGE_PATTERN = /\.(jpg|jpeg|png|gif|webp)/;

const xInRange = (x: number, range: [number, number]) => {
  return x >= range[0] && x < range[1];
};

const computedCol = (x: number) => {
  const isSmall = xInRange(x, [0, 600]);
  const isMiddle = xInRange(x, [600, 960]);
  const isLarge = xInRange(x, [960, 1400]);
  const isMax = xInRange(x, [1400, Number.MAX_VALUE]);
  return isSmall ? 2 : isMiddle ? 3 : isLarge ? 4 : isMax ? 6 : 3;
};

const computedRow = (h: number) => {
  return Math.floor((h || 30 - 30) / 180);
};

const useResponsiveSize = () => {
  const size = useSize(document.body);
  const [col, setCol] = useState(computedCol(size?.width || 1));
  const [row, setRow] = useState(computedRow(size?.height || 1));

  const pageSize = useMemo(() => {
    return col * row;
  }, [col, row]);

  useEffect(() => {
    const nextCol = computedCol(size?.width || 1);
    const nextRow = computedRow(size?.height || 1);
    if (nextCol !== col) {
      setCol(nextCol);
    }
    if (nextRow !== row) {
      setRow(nextRow);
    }
  }, [col, row, size?.height, size?.width]);
  console.log('col, pageSize', { col, pageSize });
  return { col, pageSize };
};

const Group = (props: { data: OSS.ObjectMeta }) => {
  const config = useConfig();
  const [hover, setHover] = useState(false);
  const { name, url, lastModified } = props.data;
  const [visible, setVisible] = useState(false);

  const isImage = useMemo(() => {
    return IMAGE_PATTERN.test(name);
  }, [name]);

  const displayName = useMemo(() => {
    const segs = name.split('/');
    const fullName = decodeURIComponent(segs[segs.length - 1]);
    // 移除上传的 charsIndex 前缀
    const liteName = fullName.replace(/___(.*)___/, '');
    return liteName;
  }, [name]);

  const fileUrl = useMemo(() => {
    return config?.current?.cdn
      ? `${config?.current?.cdn ?? ''}/${
          config.current.prefix
        }${encodeURIComponent(
          name.replace(config.current.prefix, ''),
        )}`.replace('//', '/')
      : url;
  }, [config, name, url]);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'all ease-in-out 0.3s',
        width: '100%',
        height: '136px',
        backgroundColor: hover ? ` var(--color-bg-4)` : ` var(--color-bg-3)`,
        backgroundImage: isImage ? `url(${fileUrl})` : 'var(--color-bg-2)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: '1px solid var(--color-border-1)',
      }}
    >
      <div
        style={{
          borderRadius: '4px',
          overflow: 'hidden',
          width: '100%',
          transition: 'all ease-in-out 0.3s',
          height: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          WebkitBackdropFilter: hover ? 'blur(0px)' : 'blur(6px)',
          backdropFilter: hover ? 'blur(0px)' : 'blur(6px)',
          padding: '16px 10px',
        }}
        onClick={() => (isImage ? setVisible(true) : null)}
      >
        <div>
          <Typography.Title
            style={{
              color: 'var(--color-text-1)',
              // textShadow: '0px 0px 10px var(--color-text-4)',
            }}
            ellipsis={{
              cssEllipsis: true,
              showTooltip: true,
              rows: 3,
            }}
            heading={6}
          >
            {displayName}
          </Typography.Title>
          <span
            style={{
              color: 'var(--color-text-2)',
            }}
          >
            {dayjs(lastModified).fromNow()}
          </span>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Copyable text={fileUrl}></Copyable>
        </div>
      </div>
      <Image.Preview
        src={fileUrl}
        visible={visible}
        onVisibleChange={setVisible}
      ></Image.Preview>
    </div>
  );
};

export const History = () => {
  const client = useClient();
  const config = useConfig();
  const [objects, setObjects] = useState<OSS.ObjectMeta[]>([]);
  const { isRoot, can, current, next, prev, setNext, reload } = usePageLink();
  const { col, pageSize } = useResponsiveSize();
  const [loading, setLoading] = useState(false);

  const groups = useMemo(() => {
    return objects.reduce((arr, item, idx) => {
      const groupIdx = Math.floor(idx / col);
      arr[groupIdx] = arr[groupIdx] || [];
      arr[groupIdx].push(item);
      return arr;
    }, [] as OSS.ObjectMeta[][]);
  }, [col, objects]);

  const load = useCallback(() => {
    if (!client || !config || pageSize <= 0) return;
    setLoading(true);
    client
      .list(
        {
          'max-keys': pageSize,
          prefix: config.current?.prefix,
          marker: isRoot(current) ? undefined : current,
        },
        {
          timeout: 1000,
        },
      )
      .then((resp) => {
        setNext(resp.nextMarker);
        const list = resp.objects;
        list.sort((a, b) =>
          dayjs(b.lastModified).isAfter(dayjs(a.lastModified)) ? 1 : -1,
        );
        setObjects(list);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client, config, current, isRoot, pageSize, setNext]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, col, pageSize]);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.current?.alias, col, pageSize]);

  return (
    <Card bordered={false}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingBottom: '16px',
        }}
      >
        <Button
          onClick={() => {
            reload();
          }}
          type="outline"
          size="small"
          icon={<IconRefresh></IconRefresh>}
        >
          刷新
        </Button>
      </div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div
          style={{
            marginRight: '-16px',
            position: 'relative',
          }}
        >
          {groups.map((group, idx) => {
            return (
              <Row
                key={idx}
                gutter={{ md: 16, lg: 16, xl: 16 }}
                style={{ width: '100%', marginBottom: '16px' }}
              >
                {group.map((item) => {
                  return (
                    <Col key={item.url} span={24 / col}>
                      <Group key={item.url} data={item}></Group>
                    </Col>
                  );
                })}
              </Row>
            );
          })}
          <AniSvg abs visible={loading} opacity={0.8}></AniSvg>
        </div>
        <Space
          style={{
            position: 'fixed',
            right: '16px',
            bottom: '16px',
            margin: '8px 0',
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {can.prev ? (
            <Button
              disabled={!can.prev}
              onClick={() => {
                prev();
              }}
              type="outline"
              icon={<IconArrowLeft />}
              style={{
                width: '100px',
              }}
              iconOnly
            ></Button>
          ) : null}

          <Button
            disabled={!can.next}
            onClick={() => {
              next();
            }}
            type="outline"
            icon={<IconArrowRight />}
            style={{
              width: '100px',
            }}
            iconOnly
          ></Button>
        </Space>
      </Space>
    </Card>
  );
};
