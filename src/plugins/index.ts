import { AliOssPlugin } from './AliOss';
import { GithubPlugin } from './Github';
import { GiteePlugin } from './Gitee';
import { QiNiuPlugin } from './QiNiu';
import { TinyPlugin } from './Tiny';

export type PluginKey = 'alioss' | 'qiniu' | 'github' | 'gitee';
export const plugins = ['alioss', 'qiniu', 'github', 'gitee'] as PluginKey[];

export const getPlugin = (name: PluginKey) => {
  return name === 'alioss'
    ? AliOssPlugin
    : name === 'qiniu'
    ? QiNiuPlugin
    : name === 'github'
    ? GithubPlugin
    : name === 'gitee'
    ? GiteePlugin
    : TinyPlugin;
};

export const getPluginSchema = (name: PluginKey) => {
  return name === 'alioss'
    ? AliOssPlugin.configSchema
    : name === 'qiniu'
    ? QiNiuPlugin.configSchema
    : name === 'github'
    ? GithubPlugin.configSchema
    : name === 'gitee'
    ? GiteePlugin.configSchema
    : TinyPlugin.configSchema;
};
