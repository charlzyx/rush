import { AliOssPlugin } from './AliOss';
import { GithubPlugin } from './Github';
import { QiNiuPlugin } from './QiNiu';
import { TinyPlugin } from './Tiny';

export type PluginKey = 'alioss' | 'qiniu' | 'github';
export const plugins = ['alioss', 'qiniu', 'github'] as PluginKey[];

export const getPlugin = (name: PluginKey) => {
  return name === 'alioss'
    ? AliOssPlugin
    : name === 'qiniu'
    ? QiNiuPlugin
    : name === 'github'
    ? GithubPlugin
    : TinyPlugin;
};

export const getPluginSchema = (name: PluginKey) => {
  return name === 'alioss'
    ? AliOssPlugin.configSchema
    : name === 'qiniu'
    ? QiNiuPlugin.configSchema
    : name === 'github'
    ? GithubPlugin.configSchema
    : TinyPlugin.configSchema;
};
