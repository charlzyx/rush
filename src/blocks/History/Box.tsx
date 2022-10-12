import { StoreItem } from '@/shared/typings';
import { Button, Image, Space, Typography } from '@arco-design/web-react';
import { IconFile, IconFolder } from '@arco-design/web-react/icon';
import { path, shell } from '@tauri-apps/api';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Copyable } from './Copyable';
import './item.css';

const IMAGE_PATTERN = /\.(jpg|jpeg|png|gif|webp|svg)/;
const FILE_PATTERN = /file:\/\//;

export const Box = (props: {
  data: StoreItem;
  fit?: 'cover' | 'contain';
  blur?: number;
}) => {
  const [hover, setHover] = useState(false);
  const { name, url, create_time } = props.data;
  const [visible, setVisible] = useState(false);

  const isImage = useMemo(() => {
    return IMAGE_PATTERN.test(name);
  }, [name]);

  const displayName = useMemo(() => {
    const decodeName = decodeURIComponent(name);
    return decodeName;
  }, [name]);

  const fileUrl = useMemo(() => {
    const isFile = FILE_PATTERN.test(url);
    if (isFile) {
      return convertFileSrc(url.replace(FILE_PATTERN, ''));
    } else {
      return url;
    }
  }, [url]);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="item-wrapper"
      style={{
        backgroundColor: hover ? ` var(--color-bg-4)` : ` var(--color-bg-3)`,
        backgroundImage: isImage ? `url(${fileUrl})` : 'var(--color-bg-2)',
        backgroundSize: props.fit ?? 'cover',
      }}
    >
      <div
        className="item-inner"
        style={{
          WebkitBackdropFilter: !hover
            ? 'blur(0px)'
            : `blur(${props.blur ?? 6}px)`,
          backdropFilter: !hover ? 'blur(0px)' : `blur(${props.blur ?? 6}px)`,
        }}
        onClick={() => (isImage ? setVisible(true) : null)}
      >
        <div>
          <Typography.Title
            style={{
              color: 'var(--color-text-1)',
              opacity: isImage && hover ? 1 : 0,
              transition: 'opacity ease 0.2s',
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
            {dayjs(create_time).fromNow()}
          </span>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {FILE_PATTERN.test(url) ? (
            <Space>
              <Button
                onClick={() => {
                  shell.open(url);
                }}
                size="small"
                icon={<IconFile></IconFile>}
                iconOnly
                type="outline"
              ></Button>
              <Button
                onClick={() => {
                  path.dirname(url).then((dir) => {
                    shell.open(dir);
                  });
                }}
                size="small"
                icon={<IconFolder></IconFolder>}
                iconOnly
                type="outline"
              ></Button>
            </Space>
          ) : (
            <Copyable text={fileUrl}></Copyable>
          )}
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
