import { Notification } from '@arco-design/web-react';
import { PluginKey } from '@/plugins';

export const notify = {
  success: (title: string, content: string) => {
    return Notification.success({
      title,
      content,
      duration: 566,
    });
  },
  err(scope: PluginKey | 'HTTP' | 'DB', title: string, content: string) {
    return Notification.error({
      title: `[${scope}] ${title}`,
      content,
      duration: 2000,
    });
  },
};
