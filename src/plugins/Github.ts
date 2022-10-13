import { DB } from '@/db';
import { StoreItem } from '@/shared/typings';
import { store } from '@/store';
import { toBase64 } from '@/utils/fs';
import { notify } from '@/utils/notify';
import { parse } from '@/utils/parse';
import { req } from '@/utils/req';
import tiny from '@mxsir/image-tiny';
import dayjs from 'dayjs';
import { TINY_SUPPORTE } from './config';
import { Plugin, PluginConfigSchemaItem } from './Plugin';

export interface GithubPluginConfig {
  quality?: number;
  repo: string;
  branch: string;
  token: string;
  path: string;
  customUrl: string;
}

const timeOf = (baseUrl: string, branch: string, filePath: string) => {
  return req
    .get(`${baseUrl}commits`, {
      params: { path: filePath, per_pageinteger: 1, sha: branch },
    })
    .then((resp) => resp.data)
    .then((commits) => {
      const commit = commits[0].commit;
      return commit?.committer?.date;
    });
};

const list = async (url: string) => {
  const items = await req.get(url).then((resp) => resp.data);
  const files = items.filter((item: any) => item.type === 'file');
  files.sort((a: any, b: any) => +dayjs(a.name) - +dayjs(b.name));
  const dirs = items.filter((item: any) => item.type === 'dir');
  dirs.sort((a: any, b: any) => +dayjs(a.name) - +dayjs(b.name));

  if (dirs.length > 0) {
    const children = await Promise.all(
      dirs.map(async (dir: any) => {
        return await list(dir.url);
      }),
    );
    const flatten = children.reduce((li, item) => [...li, ...item]);
    flatten.sort((a: any, b: any) => +dayjs(a.name) - +dayjs(b.name));
    files.push(...flatten);
  }

  return files as {
    download_url: string;
    path: string;
    url: string;
    name: string;
    sha: string;
    size: number;
  }[];
};

export class GithubPlugin extends Plugin {
  name = 'github';
  config: GithubPluginConfig = {
    ...store.get('config_current')?.github,
    quality: 80,
  };

  static configSchema: PluginConfigSchemaItem[] = [
    {
      label: '仓库名称',
      name: 'repo',
      required: true,
      help: '格式 user/repo',
      helpLink: 'https://github.com',
    },
    { label: '分支名称', name: 'branch', required: true },
    {
      label: 'token',
      name: 'token',
      required: true,
      help: 'Github Personal access token',
      helpLink:
        'https://picgo.github.io/PicGo-Doc/zh/guide/config.html#github%E5%9B%BE%E5%BA%8A',
    },
    {
      label: '文件夹',
      name: 'path',
      required: false,
      help: '不管是否设置, 都会在之后追加 YYYY_MM_DD 文件夹格式',
    },
    {
      label: '自定义链接',
      name: 'customUrl',
      required: false,
      help: '通常情况下, 可以用 https://cdn.jsdelivr.net/gh/USER/REPO@BRANCH 来加速',
    },
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

  async upload(file: File, alias: string): Promise<StoreItem> {
    const fileName = file.name;
    const dirPrefix = dayjs().format('YYYY_MM_DD');
    const encodeName = encodeURI(fileName);
    const { branch, customUrl, path = '', repo, token } = this.config;

    const remotePath = `${encodeURI(path)}${dirPrefix}/${encodeName}`;
    const url = `https://api.github.com/repos/${repo}/contents/${remotePath}`;
    const content = await toBase64(file);

    const uploading = req
      .put(
        url,
        {
          message: 'Upload by Rush',
          branch: branch,
          content: content,
          path: remotePath,
        },
        {
          headers: {
            accept: 'application/vnd.github+json',
            Authorization: `token ${token}`,
            'User-Agent': 'Rush',
          },
        },
      )
      .then((resp) => resp.data)
      .catch((e) => {
        const msg = e?.response?.data?.message || '上传出错啦';
        notify.err('github', '上传失败', msg);
      });

    const resp = await uploading;
    const ret: StoreItem = {
      scope: this.name,
      alias,
      size: file.size,
      extra: JSON.stringify({ sha: resp?.content?.sha }),
      name: file.name,
      hash: resp.content?.path + file.name,
      create_time: +new Date(),
      url: customUrl
        ? `${customUrl}/${remotePath}`
        : resp?.content?.download_url!,
    };

    return ret;
  }

  async remove(item: StoreItem): Promise<boolean> {
    try {
      const extra = parse(item.extra!);
      const { url, sha } = extra;
      const { token } = this.config;
      await req.delete(url, {
        headers: {
          accept: 'application/vnd.github+json',
          Authorization: `token ${token}`,
          'User-Agent': 'Rush',
        },
        data: {
          message: 'Remove by Rush',
          sha,
        },
      });
      // console.log('github remove url', url, ret);
      await DB.remove(item);
      return Promise.resolve(true);
    } catch (error: any) {
      notify.err('github', '删除失败', error?.message);
      throw error;
    }
  }

  async sync(alias: string) {
    try {
      const { repo, branch } = this.config;
      const baseUrl = `https://api.github.com/repos/${repo}/`;
      const url = `https://api.github.com/repos/${repo}/contents?ref=${branch}`;

      const files = await list(url);
      const withTimes = await Promise.all(
        files.map(async (file) => {
          const time = await timeOf(baseUrl, branch, file.path);
          return {
            ...file,
            create_time: +dayjs(time),
          };
        }),
      );
      const total = files.length;

      const items: StoreItem[] = withTimes.map((item) => {
        return {
          scope: this.name,
          alias: alias,
          create_time: item.create_time,
          name: item.name,
          size: item.size,
          hash: `${item.path}/${item.name}`,
          url: item.download_url,
          extra: JSON.stringify({ sha: item.sha, url: item.url }),
        };
      });

      await DB.sync(items);

      return {
        list: items,
        total,
      };
    } catch (error: any) {
      notify.err('github', '同步失败', error?.message);
      throw error;
    }
  }
}
