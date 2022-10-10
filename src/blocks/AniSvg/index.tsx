import { ReactComponent as Brand } from './brand.svg';
import { ReactComponent as Wait } from './wait.svg';
import { ReactComponent as Work } from './work.svg';

import { useThrottle } from 'ahooks';
import React from 'react';
import './ani.css';

const AbsoluteWrapper = (
  props: React.PropsWithChildren<{ style?: React.CSSProperties }>,
) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        transition: 'all ease 0.3s',
        opacity: 1,
        height: '83vh',
        background: 'rgba(var(--gray-1), 0.9)',
        WebkitBackdropFilter: 'blur(4px)',
        backdropFilter: 'blur(4px)',
        padding: '100px',
        transform: 'translate3d(0, 0, 0)',
        zIndex: 100,
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
};
export const AniSvg = (props: {
  className?: string;
  name?: 'work' | 'wait' | 'brand';
  opacity?: number;
  visible?: boolean;
  abs?: boolean;
}) => {
  const Comp =
    props.name === 'work' ? Work : props.name === 'brand' ? Brand : Wait;
  const Abs = props.abs ? AbsoluteWrapper : React.Fragment;

  const lazy = useThrottle(props.visible ?? true, { wait: 666 });

  return lazy ? (
    <Abs>
      <Comp
        style={{ opacity: props.opacity || 1 }}
        className={`${props.className || ''} ooop`}
      ></Comp>
    </Abs>
  ) : null;
};
