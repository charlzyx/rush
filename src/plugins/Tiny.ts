import { DB } from '@/db';
import { Plugin } from './Plugin';
import { PageQuery, PageResp, StoreItem } from '@/shared/http';
import tiny from '@mxsir/image-tiny';
import md5 from 'md5';
import { Fs } from './fs';

export interface TinyConfig {
  quality: number;
  output?: string;
  allowOverwrite?: boolean;
}

const IMAGE_PATTERN = /\.(jpg|jpeg|png|gif|webp)/;

export class TinyPlugin extends Plugin {
  name = 'tiny';
  config: TinyConfig = { quality: 80, allowOverwrite: false };
  fs: Fs;

  constructor(config: TinyConfig) {
    super();
    this.config = { ...this.config, ...config };
    this.fs = new Fs(this.config.output);
  }

  async existed(file: File) {
    if (this.config.allowOverwrite) {
      return false;
    }
    const buffer = await file.arrayBuffer();
    const sign = md5(new Uint8Array(buffer));
    const exist = await DB.exist('tiny', { md5: sign });
    return exist;
  }

  async transform(file: File): Promise<File> {
    if (IMAGE_PATTERN.test(file.name)) {
      const lite = await tiny(file, this.config.quality);
      return lite;
    } else {
      return Promise.resolve(file);
    }
  }

  async upload(file: File): Promise<StoreItem> {
    const exist = await this.existed(file);
    if (exist) {
      return exist as any;
    }

    const buffer = await file.arrayBuffer();
    const sign = md5(new Uint8Array(buffer));
    const url = await this.fs.wirte(file.name, buffer);

    const ret = {
      scope: this.name,
      name: file.name,
      createTime: +new Date(),
      md5: sign,
      url: `file://${url}`,
    };

    return ret;
  }

  async query(query: PageQuery): Promise<PageResp> {
    return DB.query<StoreItem>(this.name, query);
  }
}
