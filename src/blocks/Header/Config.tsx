// import { useConfig } from '@/store';
import { usePluginSettings } from '../Settings';
import { Button, Cascader } from '@arco-design/web-react';
import { IconCloud } from '@arco-design/web-react/icon';

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
      return [scope, current?.alias];
    } else {
      return undefined;
    }
  }, [current?.alias, scope]);

  return (
    <div style={{ display: 'flex', width: '160px' }}>
      <Button
        style={{
          marginRight: '-8px',
        }}
        icon={<IconCloud></IconCloud>}
        iconOnly
        type="default"
      ></Button>
      <Cascader
        style={{ width: '140px' }}
        value={val}
        onChange={(next) => {
          const [nextScope, nextAlias] = next as any[];
          setScope(nextScope);
          actions.setCurrent(nextAlias!, nextScope);
        }}
        placeholder="请补全上传配置"
        options={options}
      />
    </div>
  );
};
