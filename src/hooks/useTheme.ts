import { useCallback, useEffect, useState } from 'react';
// import { window } from '@tauri-apps/api';

const getInitTheme = () => {
  try {
    let media = (window as any).matchMedia('(prefers-color-scheme: dark)');
    return media.matches ? 'dark' : 'light';
  } catch (error) {
    return 'light';
  }
};
export const useTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitTheme());

  useEffect(() => {
    // https://hdj.me/listening-darkmode-by-javascript/
    try {
      let media = (window as any).matchMedia('(prefers-color-scheme: dark)');
      let callback = (e: any) => {
        let prefersDarkMode = e.matches;
        if (prefersDarkMode) {
          // 搞事情
          setTheme('dark');
        }
      };
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', callback);
      } else if (typeof media.addListener === 'function') {
        media.addListener(callback);
      }
    } catch (error) {
      console.log('eee', error);
    }
  }, []);

  useEffect(() => {
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
