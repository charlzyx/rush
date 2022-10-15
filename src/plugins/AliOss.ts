import { DB } from '@/db';
import { Plugin, PluginConfigSchemaItem, PluginSupported } from './Plugin';
import { StoreItem } from '@/shared/typings';
import tiny from '@mxsir/image-tiny';
import { store } from '@/store';
import OSS from 'ali-oss';
import { TINY_SUPPORTE } from './config';
import dayjs from 'dayjs';
import { notify } from '@/utils/notify';
import { parse } from '@/utils/parse';
import { CommonConfig, compileConfig, getCommonConfigSchema } from './Plugin';
import { Modal } from '@arco-design/web-react';

export interface AliOssConfig extends CommonConfig {
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
  bucket: string;
}

const loop = async (client: OSS, prefix: string, marker?: string) => {
  const resp = await client.list(
    { prefix, marker, 'max-keys': 1000 },
    { timeout: 100000 },
  );
  const { nextMarker, objects } = resp;
  if (nextMarker) {
    const next = await loop(client, prefix, nextMarker);
    objects.push(...next);
  }
  return objects || [];
};

export class AliOssPlugin extends Plugin {
  name = 'alioss';
  supported: PluginSupported = {
    upload: true,
    clear: true,
    remove: true,
    sync: true,
  };
  config: AliOssConfig = {
    ...store.get('config_current')?.alioss,
    quality: 80,
    secure: true,
  };
  client: OSS;

  static configSchema: PluginConfigSchemaItem[] = [
    {
      label: 'accessKeyId',
      name: 'accessKeyId',
      required: true,
      help: '参考 PicGo 说明',
      helpLink:
        'https://picgo.github.io/PicGo-Doc/zh/guide/config.html#%E9%98%BF%E9%87%8C%E4%BA%91oss',
    },
    {
      label: 'accessKeySecret',
      name: 'accessKeySecret',
      required: true,
      help: '参考 PicGo 说明',
      helpLink:
        'https://picgo.github.io/PicGo-Doc/zh/guide/config.html#%E9%98%BF%E9%87%8C%E4%BA%91oss',
    },
    { label: '存储区域名称', name: 'region', required: true, help: 'region' },
    { label: '存储空间名称', name: 'bucket', required: true, help: 'bucket' },
    ...getCommonConfigSchema(),
  ];

  constructor(config: AliOssConfig) {
    super();
    this.config = compileConfig({ ...this.config, ...config });

    this.client = new OSS(this.config);
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
    const conf = compileConfig(this.config, file.name);
    const { filePath, dir, customUrl } = conf;

    const upload = await this.client
      ?.multipartUpload(encodeURI(filePath!), file, {
        // progress(p, cpt, res) {
        //   // console.log({ p, cpt, res });
        // },
        parallel: 4,
        partSize: 102400 * 200,
      })
      .catch((e) => {
        const msg = e.message;
        notify.err('alioss', '上传', msg);
        throw e;
      });

    const ret: StoreItem = {
      scope: this.name,
      alias,
      dir: dir,
      name: file.name,
      size: file.size,
      hash: filePath!,
      url: customUrl ? `${customUrl}/${upload.name}` : (upload.data as any).url,
      create_time: +new Date(),
      extra: JSON.stringify(upload.data),
    };

    return ret;
  }

  async remove(item: StoreItem): Promise<boolean> {
    try {
      await this.client?.delete(item.hash);
      await DB.remove(item);
      return Promise.resolve(true);
    } catch (error: any) {
      notify.err('alioss', item.alias, `远程删除失败: ${error?.message}`);
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
    const { dir, customUrl } = this.config;
    // const { prefix } = this.config;
    try {
      const files = await loop(this.client!, dir!);
      files.sort((a, b) => +dayjs(a.lastModified) - +dayjs(b.lastModified));

      const items: StoreItem[] = files.map((item) => {
        console.log('ali remote item:', item);
        return {
          scope: this.name,
          alias: alias,
          dir: item.name,
          name: item.name.replace(`${dir}/`, ''),
          hash: item.name,
          size: item.size,
          url: customUrl ? `${customUrl}/${item.name}` : item.url,
          extra: JSON.stringify(item),
          create_time: +dayjs(item.lastModified),
        };
      });
      await DB.sync(items);
      return {
        list: items,
        total: items.length,
      };
    } catch (error: any) {
      notify.err('alioss', alias, `同步远程数据失败: ${error?.message}`);
      throw error;
    }
  }
}
