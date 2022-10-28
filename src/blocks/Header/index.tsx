import { Button } from '@arco-design/web-react';
import { IconGithub } from '@arco-design/web-react/icon';
import React from 'react';
import { Menu } from './Menu';
import { shell } from '@tauri-apps/api';
import { Pin } from './Pin';
import { Theme } from './Theme';
import { Win } from './Win';

const css: Record<string, React.CSSProperties> = {
  item: {
    paddingRight: 16,
  },
};

export const Header = () => {
  return (
    <div
      data-tauri-drag-region
      style={{
        paddingTop: '13px',
        paddingRight: '13px',
        paddingLeft: '13px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <div>
        <Win></Win>
        <div data-tauri-drag-region style={{ flex: 1 }}></div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div style={css.item}>
          <Menu></Menu>
        </div>
        <div style={css.item}>
          <Theme></Theme>
        </div>
        <div>
          <Pin></Pin>
        </div>
      </div>
    </div>
  );
};
