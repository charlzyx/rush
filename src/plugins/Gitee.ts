import { DB } from '@/db';
import { Plugin, PluginConfigSchemaItem } from './Plugin';
import { PageQuery, PageResp, StoreItem } from '@/shared/typings';
import tiny from '@mxsir/image-tiny';
import md5 from 'md5';
import { store } from '@/store';
import { TINY_SUPPORTE } from './config';
import { Notification } from '@arco-design/web-react';
import { req } from '@/utils/req';
import dayjs from 'dayjs';

const toBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result as any);
    };
    reader.onerror = reject;
  }).then((complex) => {
    // data:image/png;base64,xxxxx
    return complex.replace(/^data:.*base64,/, '');
  });
};

export interface GiteePluginConfig {
  quality?: number;
  repo: string;
  branch: string;
  token: string;
  path: string;
  customUrl: string;
}

export class GiteePlugin extends Plugin {
  name = 'gitee';
  config: GiteePluginConfig = {
    ...store.get('config_current')?.gitee,
    quality: 80,
    secure: true,
  };
  static configSchema: PluginConfigSchemaItem[] = [
    { label: 'repo', name: 'repo', required: true },
    { label: 'branch', name: 'branch', required: true },
    { label: 'token', name: 'token', required: true },
    { label: 'path', name: 'path', required: false },
    { label: 'customUrl', name: 'customUrl', required: false },
  ];

  constructor(config: GiteePluginConfig) {
    super();
    this.config = { ...this.config, ...config };
  }

  async transform(file: File): Promise<File> {
    if (this.config.quality! < 100 && TINY_SUPPORTE.test(file.name)) {
      const lite = await tiny(file, this.config.quality);
      return lite;
    } else {
      return Promise.resolve(file);
    }
  }

  async upload(file: File): Promise<StoreItem> {
    const fileName = file.name;
    const datePrefix = dayjs().format('YYYY_MM_DD');
    const encodeName = encodeURI(fileName);
    const { branch, customUrl, path = '', repo, token } = this.config;

    const remotePath = `${encodeURI(path)}${datePrefix}/${encodeName}`;
    const url = `https://gitee.com/api/v5/repos/${repo}/contents/${remotePath}?access_token=${token}`;
    const content = await toBase64(file);

    const uploading = req
      .post(
        url,
        {
          message: 'Upload by Rush',
          branch: branch,
          content: content,
          // sha: md5(remotePath),
          path: remotePath,
        },
        {
          headers: {
            // accept: 'application/vnd.github+json',
            Authorization: `token ${token}`,
            'User-Agent': 'Rush',
          },
        },
      )
      .then((resp) => resp.data)
      .catch((e) => {
        console.log(e);
        const msg = e?.response?.data?.messages?.join(' ') || '上传出错啦';
        Notification.error({
          title: '上传失败！Plug::Gitee',
          content: msg,
        });
      });

    try {
      const resp = await uploading;
      const ret = {
        scope: this.name,
        name: file.name,
        create_time: +new Date(),
        url: customUrl
          ? `${customUrl}/${remotePath}`
          : resp.content!.download_url!,
      };

      return ret;
    } catch (error: any) {
      throw error;
    }
  }

  async query(query: PageQuery): Promise<PageResp> {
    return DB.query<StoreItem>(this.name, query);
  }
}
