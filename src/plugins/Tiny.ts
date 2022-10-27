import { StoreItem } from '@/shared/typings';
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
      url: `asset://${url}`,
      create_time: +new Date(),
      extra: '',
    };

    return ret;
  }
}
