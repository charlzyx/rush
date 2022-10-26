import { tiny } from '@/lib/pngtiny';
import { StoreItem } from '@/shared/typings';
import { Fs } from '@/utils/fs';
import dayjs from 'dayjs';
import { TINY_SUPPORTE } from './config';
import { Plugin, renameFile } from './Plugin';

export interface TinyConfig {
  quality: number;
  output?: string;
}

export class TinyPlugin extends Plugin {
  name = 'tiny';
  config: TinyConfig = { quality: 80 };

  constructor(config: TinyConfig) {
    super();
    this.config = { ...this.config, ...config };
    Fs.setOutput(this.config.output);
  }

  async transform(file: File): Promise<File> {
    if (TINY_SUPPORTE.test(file.name)) {
      // https://pqina.nl/blog/rename-a-file-with-javascript/
      const lite = await tiny(file, this.config.quality);
      return lite;
    } else {
      return Promise.resolve(file);
    }
  }

  async upload(file: File, alias: string): Promise<StoreItem> {
    const buffer = await file.arrayBuffer();
    const fileName = file.name;
    const url = await Fs.wirte(fileName, buffer);

    const ret: StoreItem = {
      size: file.size,
      alias,
      scope: this.name,
      hash: fileName,
      dir: '',
      name: fileName,
      url: `file://${url}`,
      create_time: +new Date(),
      extra: '',
    };

    return ret;
  }
}
