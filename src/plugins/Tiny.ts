import { StoreItem } from '@/shared/typings';
import tiny from '@mxsir/image-tiny';
import { TINY_SUPPORTE } from './config';
import { Fs } from '@/utils/fs';
import { Plugin } from './Plugin';

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
      const lite = await tiny(file, this.config.quality);
      return lite;
    } else {
      return Promise.resolve(file);
    }
  }

  async upload(file: File, alias: string): Promise<StoreItem> {
    const buffer = await file.arrayBuffer();
    const url = await Fs.wirte(file.name, buffer);

    const ret: StoreItem = {
      size: file.size,
      extra: '',
      alias,
      scope: this.name,
      hash: file.name,
      name: file.name,
      create_time: +new Date(),
      url: `file://${url}`,
    };

    return ret;
  }
}
