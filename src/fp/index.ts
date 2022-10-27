import { FilePond, registerPlugin } from 'react-filepond';
import * as FilePonds from 'filepond';
import 'filepond/dist/filepond.min.css';
import zhCN from 'filepond/locale/zh-cn.js';
import FilePondPluginFileRename from 'filepond-plugin-file-rename';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
// import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
// import FilePondPluginImageResize from 'filepond-plugin-image-resize';
// @ts-ignore
import FilePondPluginTiny from './tiny';
import './tiny.css';

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileRename,
  FilePondPluginTiny,
  // FilePondPluginImageTransform,
  // FilePondPluginImageResize,
);

FilePonds.setOptions({
  ...zhCN,
});

export const Rush = FilePond;

export type ProcessServer = FilePonds.ProcessServerConfigFunction;
