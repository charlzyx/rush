import { useCallback, useEffect, useState } from 'react';
import { window } from '@tauri-apps/api';

// // 窗口置顶
// function handleWindowTop() {
//   let curWin = window.getCurrent();
//   if (datas.winTop === '窗口置顶') {
//     curWin.setAlwaysOnTop(true);
//     datas.winTop = '取消置顶';
//   } else {
//     curWin.setAlwaysOnTop(false);
//     datas.winTop = '窗口置顶';
//   }
// }
export const useTop = () => {
  const [top, setTop] = useState(false);

  useEffect(() => {
    let curWin = window.getCurrent();
    if (top) {
      curWin.setAlwaysOnTop(true);
    } else {
      curWin.setAlwaysOnTop(false);
    }
  }, [top]);

  const toggle = useCallback(() => {
    setTop((x) => !x);
  }, []);
  return [top, toggle, setTop] as const;
};
