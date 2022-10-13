import { Button } from '@arco-design/web-react';
import { IconPushpin } from '@arco-design/web-react/icon';

import { useTop } from '@/hooks/useTop';

export const Pin = () => {
  const [top, toggle] = useTop();

  return (
    <Button
      type={top ? 'primary' : 'default'}
      icon={<IconPushpin></IconPushpin>}
      onClick={toggle}
      iconOnly
    ></Button>
  );
};
