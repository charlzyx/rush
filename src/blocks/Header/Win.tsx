import React from 'react';
import { IconClose, IconMax, IconSleep } from '@/assets/index';
import { appWindow } from '@tauri-apps/api/window';
import { AniSvg } from '@/blocks/AniSvg';
import './icon.css';

export const Win = () => {
  return (
    <div
      data-tauri-drag-region
      style={{
        fontSize: '1.4rem',
        display: 'flex',
        position: 'relative',
        top: '-3px',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div
        className="icon-box red"
        onClick={() => {
          appWindow.close();
        }}
      >
        <IconClose className="arco-icon ani"></IconClose>
      </div>
      <div
        className="icon-box yellow"
        onClick={() => {
          appWindow.minimize();
        }}
      >
        <IconSleep className="arco-icon ani"></IconSleep>
      </div>
      <div
        className="icon-box green"
        onClick={() => {
          appWindow.toggleMaximize();
        }}
      >
        <IconMax className="arco-icon ani"></IconMax>
      </div>
      <div data-tauri-drag-region className="header-title">
        <AniSvg name="brand"></AniSvg>
      </div>
    </div>
  );
};
