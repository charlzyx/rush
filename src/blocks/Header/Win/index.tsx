import React from 'react';
import { ReactComponent as Close } from './close.svg';
import { ReactComponent as Mini } from './mini.svg';
import { ReactComponent as Max } from './max.svg';
import { appWindow } from '@tauri-apps/api/window';
import './win.css';

export const Win = (props: { mac?: boolean }) => {
  return (
    <div data-tauri-drag-region className={`titlebar`}>
      {props.mac ? null : (
        <React.Fragment>
          <div
            onClick={() => appWindow.minimize()}
            className="titlebar-button"
            id="titlebar-minimize"
          >
            <Mini></Mini>
          </div>
          <div
            onClick={() => appWindow.toggleMaximize()}
            className="titlebar-button"
            id="titlebar-maximize"
          >
            <Max></Max>
          </div>
          <div
            onClick={() => appWindow.close()}
            className="titlebar-button titlebar-close"
            id="titlebar-close"
          >
            <Close></Close>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};
