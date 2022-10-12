import { Button, Message, Space } from '@arco-design/web-react';
import copy from '@arco-design/web-react/es/_util/clipboard';
import { IconCopy, IconLaunch } from '@arco-design/web-react/icon';
import { shell } from '@tauri-apps/api';

export const Copyable = (props: { text: string; open?: boolean }) => {
  return (
    <Space>
      <Button
        onClick={() => {
          copy(props.text).then(() => {
            Message.success(`已复制到剪切板 ${props.text}`);
          });
        }}
        iconOnly
        icon={<IconCopy></IconCopy>}
        type="text"
      ></Button>
      <Button
        onClick={() => {
          copy(props.text).then(() => {
            shell.open(props.text);
          });
        }}
        iconOnly
        icon={<IconLaunch></IconLaunch>}
        type="text"
      ></Button>
    </Space>
  );
};
