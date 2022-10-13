import { dialog, fs, path } from '@tauri-apps/api';
import { writeBinaryFile } from '@tauri-apps/api/fs';
import { store } from '@/store';

export const makesure = async (dir: string) => {
  const exist = (await fs.exists(dir)) as any;
  if (!exist) {
    await fs.createDir(dir, {
      recursive: true,
    });
  }
};

export const toBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result as any);
    };
    reader.onerror = reject;
  }).then((withPrefix) => {
    // data:image/png;base64,xxxxx
    return withPrefix.replace(/^data:.*base64,/, '');
  });
};

export class Fs {
  static output: string = store.get('output');
  static unzipTo(dir: string, zipFile: string) {}

  static async setOutput(dir?: string) {
    if (dir) {
      Fs.output = dir;
      store.set('output', dir);
    } else {
      const desktop = await path.desktopDir();
      const tinyoutput = await path.join(desktop, 'rush');
      store.set('output', tinyoutput);
      Fs.output = tinyoutput;
    }
  }

  static getThenSetOuputDir() {
    return dialog
      .open({
        directory: true,
        multiple: false,
      })
      .then((dir) => {
        Fs.output = dir as string;
        // return dir as string;
      });
  }

  static async wirte(fileName: string, buffer: ArrayBuffer) {
    await makesure(Fs.output);
    const to = await path.join(Fs.output, fileName);
    await writeBinaryFile({
      contents: buffer,
      path: to,
    });
    return to;
  }
}
