import { os } from '@tauri-apps/api';
import React, { useEffect, useMemo, useState } from 'react';
import { Menu } from './Menu';
import { Pin } from './Pin';
import { Logo } from './Logo';
import './style.css';
import { Theme } from './Theme';
import { Win } from './Win';

const css: Record<string, React.CSSProperties> = {
  item: {
    paddingRight: 16,
  },
};

const useOsType = () => {
  const [osType, setOsType] = useState<os.OsType | null>(null);
  useEffect(() => {
    os.type().then(setOsType);
  }, []);

  return osType;
};

export const Header = () => {
  const osType = useOsType();
  const notMac = useMemo(() => {
    return osType !== 'Darwin';
  }, [osType]);

  const flexDirection = useMemo(() => {
    return notMac ? 'row-reverse' : 'row';
  }, [notMac]);
  return (
    <div
      data-tauri-drag-region
      style={{
        paddingTop: '13px',
        paddingRight: '13px',
        paddingLeft: '13px',
        display: 'flex',
        flexDirection,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      {notMac ? <Win></Win> : null}
      <div data-tauri-drag-region style={{ flex: 1 }}></div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection,
        }}
      >
        <div style={css.item}>
          <Menu></Menu>
        </div>
        <div style={css.item}>
          <Theme></Theme>
        </div>
        <div style={css.item}>
          <Pin></Pin>
        </div>
        <div style={notMac ? css.item : {}}>
          <Logo></Logo>
        </div>
      </div>
    </div>
  );
};
