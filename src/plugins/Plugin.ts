import { PageQuery, PageResp, StoreItem } from '@/shared/typings';
import { DB } from '@/db';
import React from 'react';

export interface PluginConfigSchemaItem {
  label: string;
  name: string;
  help?: string;
  helpLink?: string;
  // select
  dataSource?: { label: string; value: React.Key }[];
  required?: boolean;
}
export class Plugin {
  name: string = '';
  supported: Record<'upload' | 'sync' | 'remove', boolean> = {
    upload: true,
    remove: true,
    sync: true,
  };

  static configSchema: PluginConfigSchemaItem[] = [];

  async transform(file: File): Promise<File> {
    return Promise.resolve(file);
  }

  async testConnect(config: any): Promise<boolean> {
    return Promise.resolve(true);
  }

  async upload(file: File, alias: string): Promise<StoreItem> {
    return {
      scope: 'noop',
      alias: 'noop',
      size: 0,
      extra: '',
      name: file.name,
      hash: file.name,
      create_time: +new Date(),
      url: file.webkitRelativePath,
    };
  }

  async remove(item: StoreItem): Promise<boolean> {
    return Promise.resolve(true);
  }

  async query(query: PageQuery): Promise<PageResp> {
    return DB.query<StoreItem>(query);
  }

  async sync(alias: string): Promise<PageResp> {
    return Promise.resolve({ total: 0, list: [] });
  }
}
