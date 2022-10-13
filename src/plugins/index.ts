import { AliOssPlugin } from './AliOss';
import { GithubPlugin } from './Github';
import { QiNiuPlugin } from './QiNiu';
import { TinyPlugin } from './Tiny';
import { TxCosPlugin } from './TxCos';

export type PluginKey = 'alioss' | 'qiniu' | 'github' | 'txcos';
export const plugins = ['alioss', 'qiniu', 'github', 'txcos'] as PluginKey[];

export const getPlugin = (name: PluginKey) => {
  return name === 'alioss'
    ? AliOssPlugin
    : name === 'txcos'
    ? TxCosPlugin
    : name === 'qiniu'
    ? QiNiuPlugin
    : name === 'github'
    ? GithubPlugin
    : TinyPlugin;
};

export const getPluginSchema = (name: PluginKey) => {
  return name === 'alioss'
    ? AliOssPlugin.configSchema
    : name === 'txcos'
    ? TxCosPlugin.configSchema
    : name === 'qiniu'
    ? QiNiuPlugin.configSchema
    : name === 'github'
    ? GithubPlugin.configSchema
    : TinyPlugin.configSchema;
};
