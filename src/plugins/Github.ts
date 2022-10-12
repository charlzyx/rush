import { DB } from '@/db';
import { Plugin, PluginConfigSchemaItem } from './Plugin';
import { PageQuery, PageResp, StoreItem } from '@/shared/typings';
import tiny from '@mxsir/image-tiny';
import { store } from '@/store';
import { TINY_SUPPORTE } from './config';
import { Octokit } from '@octokit/rest';
import { req } from '@/utils/req';
import dayjs from 'dayjs';
import { render } from 'react-dom';
import { read } from 'fs';

const toBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result as any);
    };
    reader.onerror = reject;
  });
};

export interface GithubPluginConfig {
  quality?: number;
  repo: string;
  branch: string;
  token: string;
  path: string;
  customUrl: string;
}

export class GithubPlugin extends Plugin {
  name = 'github';
  config: GithubPluginConfig = {
    ...store.get('config_current')?.github,
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

  constructor(config: GithubPluginConfig) {
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
    const datePrefix = dayjs().format('YYYY_MM_DD_');
    const encodeName = encodeURIComponent(fileName);
    const { branch, customUrl, path = '', repo, token } = this.config;

    const remotePath = `${encodeURI(path)}${datePrefix}${encodeName}`;
    // const client = new Octokit({
    //   auth: token,
    //   userAgent: 'Rush',
    //   request: {
    //     fetch: undefined,
    //   },
    // });

    const url = `https://api.github.com/repos/${repo}/contents/${remotePath}`;
    console.log('url', url);
    const content = await toBase64(file);
    // const resp = await client.rest.repos.createOrUpdateFileContents({
    //   content: content,
    //   path: remotePath,
    //   branch: branch,
    //   message: 'Upload by Rush',
    //   owner: path.split('/')[0],
    //   repo: repo,
    // });

    const uploading = req
      .put(url, {
        headers: {
          Authorization: `token ${token}`,
          'User-Agent': 'Rush',
        },
        body: {
          message: 'Upload by Rush',
          branch: branch,
          content: content,
          path: remotePath,
        },
      })
      .then((resp) => resp.data);

    try {
      const resp = await uploading;
      const ret = {
        scope: this.name,
        name: file.name,
        create_time: +new Date(),
        url: customUrl
          ? `${customUrl}/${remotePath}`
          : resp.data.content!.download_url!,
      };

      return ret;
    } catch (error) {
      console.log('github error', error);
      throw error;
    }
  }

  async query(query: PageQuery): Promise<PageResp> {
    return DB.query<StoreItem>(this.name, query);
  }
}
