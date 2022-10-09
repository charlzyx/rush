import { useConfig } from '@/store';
import OSS from 'ali-oss';

export const useClient = () => {
  const config = useConfig();
  if (!config.current) return;
  return new OSS({
    secure: true,
    accessKeyId: config?.current?.accessKeyId!,
    accessKeySecret: config?.current?.accessKeySecret!,
    bucket: config?.current?.bucket,
    region: config?.current?.region,
  });
};
