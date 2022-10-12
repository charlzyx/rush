import { DB } from '@/db';
import { Plugin } from './Plugin';
import { PageQuery, PageResp, StoreItem } from '@/shared/typings';
import tiny from '@mxsir/image-tiny';
import { TINY_SUPPORTE } from './config';
import { Fs } from './fs';

export interface TinyConfig {
  quality: number;
  output?: string;
}

export class TinyPlugin extends Plugin {
  name = 'tiny';
  config: TinyConfig = { quality: 80 };
  fs: Fs;

  constructor(config: TinyConfig) {
    super();
    this.config = { ...this.config, ...config };
    this.fs = new Fs(this.config.output);
  }

  async transform(file: File): Promise<File> {
    if (TINY_SUPPORTE.test(file.name)) {
      const lite = await tiny(file, this.config.quality);
      return lite;
    } else {
      return Promise.resolve(file);
    }
  }

  async upload(file: File): Promise<StoreItem> {
    const buffer = await file.arrayBuffer();
    const url = await this.fs.wirte(file.name, buffer);

    const ret = {
      scope: this.name,
      name: file.name,
      create_time: +new Date(),
      url: `file://${url}`,
    };

    return ret;
  }
}
