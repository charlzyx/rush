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
        paddingTop: '16px',
        paddingRight: '16px',
        paddingLeft: '16px',
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
        <div style={css.item}>
          <Button
            onClick={() => {
              shell.open('https://github.com/charlzyx/rush');
            }}
            icon={<IconGithub></IconGithub>}
          ></Button>
        </div>
        <div>
          <Pin></Pin>
        </div>
      </div>
    </div>
  );
};
