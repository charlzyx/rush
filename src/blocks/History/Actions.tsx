import { Button, Message, Space } from '@arco-design/web-react';
import copy from '@arco-design/web-react/es/_util/clipboard';
import { IconCopy, IconDelete, IconLaunch } from '@arco-design/web-react/icon';
import { shell } from '@tauri-apps/api';

export const Copy = (props: { text: string }) => {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        copy(props.text).then(() => {
          Message.success(`已复制到剪切板 ${props.text}`);
        });
      }}
      iconOnly
      icon={<IconCopy></IconCopy>}
      size="small"
      type="text"
    ></Button>
  );
};

export const Open = (props: { url: string }) => {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        shell.open(props.url);
      }}
      iconOnly
      icon={<IconLaunch></IconLaunch>}
      size="small"
      type="text"
    ></Button>
  );
};

export const Remove = (props: { onClick: () => void }) => {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        props.onClick();
      }}
      iconOnly
      icon={<IconDelete></IconDelete>}
      size="small"
      type="text"
    ></Button>
  );
};
