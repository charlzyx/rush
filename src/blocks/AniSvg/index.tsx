import { ReactComponent as Work } from './work.svg';
import { ReactComponent as Wait } from './wait.svg';

import './ani.css';
import React, { useEffect, useState } from 'react';

const AbsoluteWrapper = (props: React.PropsWithChildren<{}>) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        background: 'rgba(255,255, 255, 0.3)',
        padding: '100px',
      }}
    >
      {props.children}
    </div>
  );
};
export const AniSvg = (props: {
  className?: string;
  name?: 'work' | 'wait';
  opacity?: number;
  visible?: boolean;
  abs?: boolean;
}) => {
  const Comp = props.name === 'work' ? Work : Wait;
  const Abs = props.abs ? AbsoluteWrapper : React.Fragment;
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (props.visible === false && show === true) {
      setTimeout(() => {
        setShow(false);
      }, 300);
    } else if (props.visible !== undefined) {
      setShow(Boolean(props.visible));
    }
  }, [props.visible, show]);

  return show ? (
    <Abs>
      <Comp
        style={{ opacity: props.visible !== false ? props.opacity || 1 : 0 }}
        className={`${props.className || ''} ooop`}
      ></Comp>
    </Abs>
  ) : null;
};
