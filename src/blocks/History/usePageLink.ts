import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const isRoot = (x: string) => {
  return /ROOT/.test(x);
};

export const usePageLink = () => {
  const [current, setCurrent] = useState('ROOT');
  const [link, setLink] = useState<
    Record<
      string,
      {
        prev: string;
        next: string;
      }
    >
  >({
    ROOT: {
      prev: '',
      next: '',
    },
  });

  const pointer = useRef({
    current,
    prev: '',
    next: '',
  });

  const prev = useCallback(() => {
    if (pointer.current.prev) {
      const now = pointer.current.prev;
      pointer.current.next = pointer.current.current;
      pointer.current.current = now;
      pointer.current.prev = link[pointer.current.prev]?.prev;
      setCurrent(now);
    }
  }, [link]);

  const next = useCallback(() => {
    if (pointer.current.next) {
      const now = pointer.current.next;
      pointer.current.prev = pointer.current.current;
      pointer.current.current = now;
      // 可能存过
      pointer.current.next = link[pointer.current.next]?.next;
      setCurrent(now);
    }
  }, [link]);

  const reload = useCallback(() => {
    pointer.current.current = 'ROOT';
    pointer.current.prev = '';
    pointer.current.next = link['ROOT'].next;
    setCurrent(`ROOT${new Date()}`);
  }, [link]);

  const can = useMemo(() => {
    const currentKey = isRoot(current) ? 'ROOT' : current;

    const now = link[currentKey];
    return {
      prev: now?.prev,
      next: now?.next,
    };
  }, [current, link]);

  const setNext = useCallback(
    (nextMarker: string) => {
      const neo = { ...link };
      const currentKey = isRoot(current) ? 'ROOT' : current;
      neo[currentKey].next = nextMarker;
      neo[nextMarker] = neo[nextMarker] || {
        prev: '',
        next: '',
      };
      neo[nextMarker].prev = currentKey;
      neo[nextMarker].next = nextMarker;
      pointer.current.next = nextMarker;
      setLink({ ...neo });
    },
    [current, link],
  );

  return {
    prev,
    next,
    reload,
    can,
    current,
    setNext,
    isRoot,
  };
};
