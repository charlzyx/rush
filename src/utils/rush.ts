import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import { FilePond, registerPlugin } from 'react-filepond';
import * as FilePonds from 'filepond';
import 'filepond/dist/filepond.min.css';
import zhCN from 'filepond/locale/zh-cn.js';
import FilePondPluginFileRename from 'filepond-plugin-file-rename';

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileRename,
);

FilePonds.setOptions({
  ...zhCN,
});

export const Rush = FilePond;

export type ProcessServer = FilePonds.ProcessServerConfigFunction;
