import { useConfig } from '@/store';
import { Select } from '@arco-design/web-react';

export const Config = () => {
  const config = useConfig();
  return (
    <Select
      style={{ width: '100px' }}
      onChange={(v) => {
        config?.setCurrent(v);
      }}
      value={config?.current?.alias}
      options={config?.list?.map((item) => {
        return {
          label: item.alias,
          value: item.alias,
        };
      })}
    ></Select>
  );
};
