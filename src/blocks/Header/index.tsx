import React from 'react';
import { Menu } from './Menu';
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
        {/* <div style={css.item}>
          <Config></Config>
        </div> */}
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
