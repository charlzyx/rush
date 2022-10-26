import { PageQuery, PageResp, StoreItem } from '@/shared/typings';
import { DB } from '@/db';
import React from 'react';
import dayjs from 'dayjs';

export interface PluginConfigSchemaItem {
  label: string;
  name: string;
  default?: string;
  help?: string;
  helpLink?: string;
  // select
  dataSource?: { label: string; value: React.Key }[];
  required?: boolean;
}

export type PluginSupported = Record<
  'upload' | 'sync' | 'remove' | 'clear',
  boolean
>;

export type CommonConfig = {
  quality?: number;
  dir?: string;
  fileName?: string;
  customUrl?: string;
};

export const getCommonConfigSchema = (defaults?: {
  dir?: string;
  fileName?: string;
  customUrl?: string;
}): PluginConfigSchemaItem[] => {
  return [
    {
      label: '目录',
      name: 'dir',
      required: false,
      default: defaults?.dir,
      help: '上传目录, 支持时间模版格式化, 例如: {YYYY-MM-DD} -> 2022-10-14, 所有格式请查看 -> ',
      helpLink: 'https://dayjs.gitee.io/docs/zh-CN/display/format',
    },
    {
      label: '文件名',
      name: 'fileName',
      default: defaults?.fileName,
      required: false,
      help: '文件名规则, 默认保持原始文件名, 支持变量 [unix:毫秒时间戳, fileName:原始文件名称, 其他时间格式化参考目录格式], 例如: {HH_mm}_{unix}_{fileName} -> 10_24_1665711275273_xxx.png',
      helpLink: 'https://dayjs.gitee.io/docs/zh-CN/display/format',
    },
    {
      label: '自定义链接',
      name: 'customUrl',
      default: defaults?.customUrl,
      required: false,
      help: '拼接规则: {自定义链接}/{目录(如果有的话)/{文件名} ',
    },
  ];
};

/**
  @example fileName: xxx.png
  input:  {YYYY-MM-DD}_{fileName}     output: 2022-10-14_xxx.png
  input:  _{YYYY_MM_DD}_{fileName}    output: _2022_10_14_xxx.png
  input:  solid                       output: solid
  input:  __onlyname_{fileName}_      output: __onlyname_xxx.png_
  input:  ___dateonly_{YYYY}_         output: ___dateonly_2022_
 */
const format = (
  x: string,
  o: {
    render: (tpl: string) => string;
  } & {
    [key: string & {}]: ((tpl: string) => string) | string;
  },
) => {
  const answer = x.replace(/\{([^}]+)\}/g, (m) => {
    // console.log('m is', m);
    const tpl = m.replace('{', '').replace('}', '');
    const ret = o[tpl] || o.render;
    if (typeof ret === 'function') {
      // console.log('tpl is ', tpl, ' ret is ', ret(tpl));
      return ret(tpl);
    } else {
      // console.log('tpl is ', tpl, ' ret is ', ret);
      return ret;
    }
  });
  // console.log('input: ', x, 'ouput:', answer);
  return answer;
};

export const compileConfig = <T extends CommonConfig>(
  conf: T,
  originFileName?: string,
) => {
  const dir = conf.dir
    ? format(conf.dir, {
        render: (f) => dayjs().format(f),
      })
    : '';
  const fileName = originFileName
    ? conf.fileName
      ? format(conf.fileName, {
          ...(conf as any),
          fileName: (f) => originFileName || f,
          unix: (+new Date()).toString(),
          render: (f) => dayjs().format(f),
        })
      : originFileName
    : conf.fileName;
  const customUrl = conf.customUrl
    ? format(conf.customUrl, {
        ...conf,
        render: (f: any) => f,
      } as any)
    : conf.customUrl;

  return {
    ...conf,
    customUrl,
    dir,
    fileName,
    filePath: dir ? `${dir}/${fileName}` : fileName,
  };
};

export abstract class Plugin {
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
      dir: '',
      name: file.name,
      size: 0,
      hash: file.name,
      url: file.webkitRelativePath,
      extra: '',
      create_time: +new Date(),
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
