import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import Mitt from 'mitt';

const ev = Mitt();
type OSSItem = {
  alias: string;
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
  prefix: string;
  bucket: string;
  cdn?: string;
};
export const store = {
  get(k: string) {
    const text = localStorage.getItem(k);
    try {
      return JSON.parse(text!);
    } catch (error) {
      return undefined;
    }
  },
  set(k: string, v: any) {
    localStorage.setItem(k, JSON.stringify(v));
    ev.emit('fresh');
  },
};

type Key = 'list' | 'current';

export const useStore = <S extends any>(key: Key, init?: S) => {
  const [state, setState] = useState<S>(store.get(key) ?? init);

  useEffect(() => {
    const hasStore = Boolean(store.get(key));
    if (init && !hasStore) {
      setState(init);
      store.set(key, init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = useCallback(
    (value: any) => {
      if (typeof value === 'function') {
        const neo = value(state);
        store.set(key, neo);
      } else {
        store.set(key, value);
      }
      setState(value);
    },
    [key, state],
  );
  return [state, set as typeof setState] as const;
};

const getConfig = (): {
  current: OSSItem | undefined;
  setCurrent: (key: string) => void;
  list: OSSItem[];
} => {
  const ds = store.get('list');
  const current = store.get('current');
  const neo = ds?.find((x: any) => x.accessKeyId === current);
  return {
    current: neo,
    list: ds,
    setCurrent: (key: string) => {
      store.set('current', key);
    },
  };
};

/** 将时间戳, 转换成字符串靠前的值, 主要为了解决 oss 不能根据时间排序的问题 */
export const charsIndex = (n: number) => {
  return String.fromCharCode(Number.MAX_SAFE_INTEGER - n);
};

export const useConfig = () => {
  const [config, setConfig] = useState(getConfig());
  useEffect(() => {
    ev.on('fresh', () => {
      console.log('fressss!');
      setConfig(getConfig());
    });
  }, []);

  return config;
};
