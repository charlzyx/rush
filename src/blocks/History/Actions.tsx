import { Button, Message, Space, Tooltip } from '@arco-design/web-react';
import copy from '@arco-design/web-react/es/_util/clipboard';
import { IconCopy, IconDelete, IconLaunch } from '@arco-design/web-react/icon';
import { shell } from '@tauri-apps/api';

export const Copy = (props: { text: string }) => {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        copy(props.text).then(() => {
          Message.success({
            content: `已复制 ${props.text}`,
            duration: 300,
          });
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

export const Remove = (props: { tip?: string; onClick: () => void }) => {
  return props.tip ? (
    <Tooltip content={props.tip}>
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
    </Tooltip>
  ) : (
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
