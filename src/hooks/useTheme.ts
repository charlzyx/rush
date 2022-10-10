import { useCallback, useEffect, useState } from 'react';
import { window } from '@tauri-apps/api';

export const useTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  useEffect(() => {
    // let curWin = window.getCurrent();
    if (theme === 'dark') {
      // 设置为暗黑主题
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      // 恢复亮色主题
      document.body.removeAttribute('arco-theme');
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((x) => (x === 'dark' ? 'light' : 'dark'));
  }, []);
  return [theme, toggle, setTheme] as const;
};
