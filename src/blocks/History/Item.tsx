import { StoreItem } from '@/shared/http';
import {
  Button,
  Image,
  Message,
  Space,
  Typography,
} from '@arco-design/web-react';
import copy from '@arco-design/web-react/es/_util/clipboard';
import {
  IconCopy,
  IconFile,
  IconFolder,
  IconLink,
} from '@arco-design/web-react/icon';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { path, shell } from '@tauri-apps/api';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import './item.css';

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

const IMAGE_PATTERN = /\.(jpg|jpeg|png|gif|webp|svg)/;
const FILE_PATTERN = /file:\/\//;

export const Item = (props: {
  data: StoreItem;
  unit: number;
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
    const segs = name.split('/');
    const fullName = decodeURIComponent(segs[segs.length - 1]);
    // 移除上传的 charsIndex 前缀
    const liteName = fullName.replace(/___(.*)___/, '');
    return liteName;
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
        // height: props.unit * 0.9,
        backgroundColor: hover ? ` var(--color-bg-4)` : ` var(--color-bg-3)`,
        backgroundImage: isImage ? `url(${fileUrl})` : 'var(--color-bg-2)',
        backgroundSize: props.fit ?? 'cover',
      }}
    >
      <div
        className="item-inner"
        style={{
          // height: props.unit * 0.9,
          WebkitBackdropFilter: hover
            ? 'blur(0px)'
            : `blur(${props.blur ?? 6}px)`,
          backdropFilter: hover ? 'blur(0px)' : `blur(${props.blur ?? 6}px)`,
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
