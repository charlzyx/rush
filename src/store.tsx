import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import Mitt from 'mitt';

const ev = Mitt();

export const store = {
  get(k: Key) {
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

type Key =
  | 'config_scope'
  | 'config_list'
  | 'config_current'
  | 'history_state'
  | 'output';

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

  useEffect(() => {
    ev.on('fresh', () => {
      setState(store.get(key));
    });
  }, [key]);
  return [state, set as typeof setState] as const;
};
