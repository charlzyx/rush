import { dialog, fs, path } from '@tauri-apps/api';
import { writeBinaryFile } from '@tauri-apps/api/fs';

export const makesure = async (dir: string) => {
  const exist = (await fs.exists(dir)) as any;
  if (!exist) {
    await fs.createDir(dir, {
      recursive: true,
    });
  }
};
export class Fs {
  output: string = '';
  static output: string = '';

  async init(dir?: string) {
    if (dir) {
      Fs.output = dir;
      this.output = dir;
    } else {
      const desktop = await path.desktopDir();
      const tinyoutput = await path.join(desktop, 'rush');
      Fs.output = tinyoutput;
      this.output = tinyoutput;
    }
  }

  constructor(dir?: string) {
    this.init(dir);
  }

  static getDir() {
    return dialog
      .open({
        directory: true,
        multiple: false,
      })
      .then((dir) => {
        return dir as string;
      });
  }

  async wirte(fileName: string, buffer: ArrayBuffer) {
    await makesure(this.output);
    const to = await path.join(this.output, fileName);
    await writeBinaryFile({
      contents: buffer,
      path: to,
    });
    return to;
  }
}
