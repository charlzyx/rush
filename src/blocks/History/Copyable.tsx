import { Button, Message } from '@arco-design/web-react';
import copy from '@arco-design/web-react/es/_util/clipboard';
import { IconLink } from '@arco-design/web-react/icon';

export const Copyable = (props: { text: string }) => {
  return (
    <Button
      onClick={() =>
        copy(props.text).then(() => {
          Message.success(`已复制到剪切板 ${props.text}`);
        })
      }
      iconOnly
      icon={<IconLink></IconLink>}
      type="outline"
    ></Button>
  );
};
