import { StoreItem } from '@/shared/typings';
import { Image, Tooltip } from '@arco-design/web-react';
import { IconQuestion } from '@arco-design/web-react/icon';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Copy, Open, Remove } from './Actions';
import './item.css';

const IMAGE_PATTERN = /\.(jpg|jpeg|png|gif|webp|svg)/;
const FILE_PATTERN = /file:\/\//;

export const Box = (props: {
  data: StoreItem;
  fit?: 'cover' | 'contain';
  remoteRemove?: boolean;
  onRemove: () => void;
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
      return encodeURI(url);
    }
  }, [url]);

  const black = useMemo(() => /gitee/.test(props.data.url), [props.data.url]);

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
          WebkitBackdropFilter: hover
            ? 'blur(0px)'
            : `blur(${props.blur ?? 8}px)`,
          backdropFilter: hover ? 'blur(0px)' : `blur(${props.blur ?? 8}px)`,
        }}
        onClick={() => (isImage ? setVisible(true) : null)}
      >
        <div className="item-header">
          <div
            style={{
              color: 'var(--color-text-1)',
              opacity: !isImage || black ? 1 : !hover ? 1 : 0.1,
            }}
            className="item-header-text"
          >
            {displayName}
          </div>
          <div>
            <Remove
              tip={!props.remoteRemove ? '只在本地删除' : ''}
              onClick={props.onRemove}
            ></Remove>
          </div>
        </div>

        <div
          className="item-footer"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div>
            <span
              style={{
                color: 'var(--color-text-2)',
              }}
            >
              {dayjs(create_time).fromNow()}
            </span>
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Copy text={fileUrl}></Copy>
            <Open url={fileUrl}></Open>
          </div>
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
