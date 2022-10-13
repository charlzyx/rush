import { Notification } from '@arco-design/web-react';
import { PluginKey } from '@/plugins';

export const notify = {
  success: (title: string, content: string) => {
    return Notification.success({
      title,
      content,
      duration: 1000,
    });
  },
  err(scope: PluginKey | 'HTTP', title: string, content: string) {
    return Notification.error({
      title: `[${scope}] ${title}`,
      content,
      duration: 1000,
    });
  },
};
