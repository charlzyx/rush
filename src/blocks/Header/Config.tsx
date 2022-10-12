// import { useConfig } from '@/store';
import { usePluginSettings } from '../Settings';
import { Cascader } from '@arco-design/web-react';
import { useMemo } from 'react';

export const Config = () => {
  const { actions, scope, current, plugins, setScope, allList } =
    usePluginSettings();
  const options = useMemo(() => {
    return plugins.map((name) => {
      return {
        label: name,
        value: name,
        children: allList?.[name]?.map?.((item: any) => {
          return {
            label: item.alias,
            value: item.alias,
          };
        }),
      };
    });
  }, [allList, plugins]);

  const val = useMemo(() => {
    if (scope && current?.alias) {
      return [scope, current.alias];
    } else {
      return undefined;
    }
  }, [current?.alias, scope]);

  return (
    <Cascader
      style={{ width: '140px' }}
      value={val}
      onChange={(next) => {
        const [nextScope, nextAlias] = next as any[];
        console.log('next', next);
        setScope(nextScope);
        actions.setCurrent(nextAlias!, nextScope);
      }}
      placeholder="请补充上传配置"
      options={options}
    />
  );
};
