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

export const testConfig = async (config: any) => {
  const client = new OSS({
    secure: true,
    accessKeyId: config?.accessKeyId!,
    accessKeySecret: config?.accessKeySecret!,
    bucket: config?.bucket,
    region: config?.region,
  });
  try {
    await client.list(
      {
        prefix: config.prefix,
        'max-keys': 1,
      },
      { timeout: 2000 },
    );
    return true;
  } catch (error) {
    return false;
  }
};
