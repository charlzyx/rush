import { DB } from '@/db';
import { StoreItem } from '@/shared/typings';
import { store } from '@/store';
import { toBase64 } from '@/utils/fs';
import { notify } from '@/utils/notify';
import { parse } from '@/utils/parse';
import { req } from '@/utils/req';
import { Modal } from '@arco-design/web-react';
import dayjs from 'dayjs';
import {
  CommonConfig,
  Plugin,
  PluginConfigSchemaItem,
  PluginSupported,
  compileConfig,
  getCommonConfigSchema,
} from './Plugin';

export interface GithubPluginConfig extends CommonConfig {
  repo: string;
  branch: string;
  token: string;
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

  supported: PluginSupported = {
    upload: true,
    clear: true,
    remove: true,
    sync: true,
  };

  config: GithubPluginConfig = {
    ...store.get('config_current')?.github,
    quality: 80,
  };

  static configSchema: PluginConfigSchemaItem[] = [
    {
      label: '仓库名称',
      name: 'repo',
      required: true,
      help: '格式 USER/REPO',
    },
    { label: '分支名称', name: 'branch', required: true, default: 'master' },
    {
      label: 'token',
      name: 'token',
      required: true,
      help: 'Github Personal access token',
      helpLink: 'https://github.com/settings/tokens',
    },
    ...getCommonConfigSchema(),
  ];

  constructor(config: GithubPluginConfig) {
    super();
    this.config = compileConfig({ ...this.config, ...config });
  }

  async upload(file: File, alias: string): Promise<StoreItem> {
    const { branch, customUrl, repo, token } = this.config;
    const { dir, fileName, filePath } = compileConfig(this.config, file.name);

    const encodeFilePath = encodeURI(filePath!);

    const url = `https://api.github.com/repos/${repo}/contents/${encodeFilePath}`;

    const content = await toBase64(file);

    const uploading = req
      .put(
        url,
        {
          message: `Upload ${filePath} by Rush.`,
          branch: branch,
          content: content,
          path: encodeFilePath,
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
        console.log('e', e);
        const msg = e?.response?.data?.message || '上传出错啦';
        notify.err('github', alias, `上传失败:${msg}`);
      });

    const resp = await uploading;
    const ret: StoreItem = {
      scope: this.name,
      alias,
      dir: dir,
      name: fileName!,
      hash: resp.content?.path + file.name,
      size: file.size,
      url: customUrl
        ? `${customUrl}/${filePath}`
        : resp?.content?.download_url!,
      create_time: +new Date(),
      extra: JSON.stringify({ sha: resp?.content?.sha }),
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
          message: `Delete ${
            item.dir ? `${item.dir}/${item.name}` : item.name
          } by Rush`,
          sha,
        },
      });
      await DB.remove(item);
      return Promise.resolve(true);
    } catch (error: any) {
      notify.err('github', item.alias, `远程删除失败: ${error?.message}`);
      const request = new Promise((resolve, reject) => {
        Modal.confirm({
          title: '要删除本地记录吗?',
          okText: '是的',
          cancelText: '算了',
          onOk: resolve,
          onCancel: reject,
        });
      });

      try {
        await request;
        await DB.remove(item);
        return true;
      } catch (e) {
        throw error;
      }
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
          dir: item.path,
          name: item.name,
          hash: `${item.path}/${item.name}`,
          size: item.size,
          url: item.download_url,
          extra: JSON.stringify({ sha: item.sha, url: item.url }),
          create_time: item.create_time,
        };
      });

      await DB.sync(items);

      return {
        list: items,
        total,
      };
    } catch (error: any) {
      notify.err('github', alias, `同步失败:${error?.message}`);
      throw error;
    }
  }
}
