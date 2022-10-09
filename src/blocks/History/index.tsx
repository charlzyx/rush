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
import dayjs from 'dayjs';
import copy from '@arco-design/web-react/es/_util/clipboard';
import OSS from 'ali-oss';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePageLink } from './usePageLink';

const col = 3;
const pageSize = col * 5;

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
const Group = (props: { data: OSS.ObjectMeta }) => {
  const config = useConfig();
  const [hover, setHover] = useState(false);
  const { name, url, lastModified, type } = props.data;

  const [visible, setVisible] = useState(false);
  const isImage = useMemo(() => {
    return IMAGE_PATTERN.test(name);
  }, [name]);

  const fileName = useMemo(() => {
    const segs = name.split('/');
    const fullName = decodeURIComponent(segs[segs.length - 1]);
    // 移除上传的 YYYY_MM_DD_HH_mm_ss__ 前缀
    const liteName = fullName.replace(
      /\d{4}_\d{2}_\d{2}_\d{2}_\d{2}_\d{2}__/,
      '',
    );
    return liteName;
  }, [name]);

  const fileUrl = useMemo(() => {
    return `${config?.current?.cdn ?? ''}/${name}`.replace('//', '/');
  }, [config, name]);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'all ease-in-out 0.3s',
        width: '100%',
        height: '124px',
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
            {fileName}
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

  const groups = useMemo(() => {
    return objects.reduce((arr, item, idx) => {
      const groupIdx = Math.floor(idx / col);
      arr[groupIdx] = arr[groupIdx] || [];
      arr[groupIdx].push(item);
      return arr;
    }, [] as OSS.ObjectMeta[][]);
  }, [objects]);

  const load = useCallback(() => {
    if (!client || !config) return;
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
      });
  }, [client, config, current, isRoot, setNext]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.current?.alias]);

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
          icon={<IconRefresh></IconRefresh>}
        >
          刷新
        </Button>
      </div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div
          style={{
            marginRight: '-16px',
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
        </div>
        <Space
          style={{
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
