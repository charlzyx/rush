import { Fragment, createElement, useEffect, useRef, useState } from 'react';
import Eases from 'eases';

function useInterval(callback: () => any, delay: number) {
  const savedCallback = useRef<typeof callback>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function defaultRender(
  value: string | number,
  decimals: number,
  count: number,
) {
  return `${Number(value).toFixed(decimals)} / ${count}`;
}

export function NumberEasing({
  value,
  speed = 500,
  decimals = 0,
  count,
  ease = 'quintInOut',
}: any) {
  const [renderValue, renderValueSet] = useState(value);
  const [lastTarget, lastTargetSet] = useState(value);

  const [lastUpdateTime, lastUpdateTimeSet] = useState(new Date().getTime());

  useEffect(() => {
    lastUpdateTimeSet(new Date().getTime() - 16);
    lastTargetSet(renderValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useInterval(() => {
    const currentTime = new Date().getTime();
    const absoluteProgress = (currentTime - lastUpdateTime) / speed;

    if (absoluteProgress >= 1) {
      renderValueSet(value);
    } else {
      const easedProgress = (Eases as any)[ease](absoluteProgress);
      renderValueSet(lastTarget + (value - lastTarget) * easedProgress);
    }
  }, 16);

  return createElement(Fragment, {}, [
    defaultRender(renderValue, decimals, count),
  ]);
}
