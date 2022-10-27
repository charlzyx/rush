// @ts-ignore
import { FilePondFile, FilePondOptions } from 'filepond';

declare module 'filepond' {
  // eslint-disable-next-line no-shadow
  export interface FilePondOptions {
    /** 0 - 100 */
    tinyQuality?: number;
  }
}
