import { PageQuery, PageResp, Plugin } from '@/shared';
import { StoreItem } from '@/shared/http';
import tiny from '@mxsir/image-tiny';
import md5 from 'md5';
import { Fs } from './fs';

export interface TinyConfig {
  quality: number;
  output?: string;
}

const IMAGE_PATTERN = /\.(jpg|jpeg|png|gif|webp)/;

export class TinyPlugin extends Plugin {
  name = 'tiny';
  config: TinyConfig = { quality: 80 };
  fs: Fs;

  constructor(config: TinyConfig) {
    super();
    this.config = { ...this.config, ...config };
    this.fs = new Fs(this.config.output);
  }

  transform(file: File): Promise<File> {
    if (IMAGE_PATTERN.test(file.name)) {
      const lite = tiny(file, this.config.quality);
      return lite;
    } else {
      return Promise.resolve(file);
    }
  }

  async upload(file: File): Promise<StoreItem> {
    const buffer = await file.arrayBuffer();
    const sign = md5(buffer as Uint8Array);
    const url = await this.fs.wirte(file.name, buffer);

    const ret = {
      name: file.name,
      createTime: +new Date(),
      md5: sign,
      url: `file://${url}`,
    };

    console.log('ret', ret);
    return ret;
  }
}
