import React, { useCallback, useRef } from 'react';

export const useAnalyzer = (conf: {
  finishedText: string;
  wrapper: {
    current: HTMLElement | null;
  };
}) => {
  const { wrapper, finishedText } = conf;
  const refs = useRef({
    map: {} as Record<
      string,
      {
        before: number;
        after: number;
        ratio: number;
      }
    >,
    ids: {} as Record<string, string>,
  });

  const clear = useCallback(() => {
    refs.current.map = {};
    refs.current.ids = {};
  }, []);

  const updateDOM = useCallback(() => {
    if (!wrapper.current) return;
    const map = refs.current.map;
    console.log('map', map);
    Object.keys(map).forEach((id) => {
      const li = wrapper.current?.querySelector(`#filepond--item-${id}`);
      console.log('li', li);
      const status = li?.querySelector('.filepond--file-status-main');
      console.log('status', status, status?.innerHTML);
      if (status && status.innerHTML === finishedText) {
        const ratio = map[id].ratio;
        const tip =
          100 - ratio >= 0 ? `-${(100 - ratio).toFixed(2)}%` : '未压缩';
        status.innerHTML = tip.toString();
      }
    });
  }, [finishedText, wrapper]);

  return {
    refs,
    clear,
    updateDOM,
  };
};
