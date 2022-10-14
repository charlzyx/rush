import { usePluginSettings } from '../Settings';
import { Button, Cascader, Tooltip } from '@arco-design/web-react';
import {
  IconCloud,
  IconCloudDownload,
  IconSync,
} from '@arco-design/web-react/icon';

import { useMemo, useState } from 'react';
import { getPlugin } from '@/plugins';
import { isPropertySignature } from 'typescript';

export const Config = () => {
  const { actions, scope, current, plugins, setScope, allList } =
    usePluginSettings();
  const [syncing, setSyncing] = useState(false);

  const plug = useMemo(() => {
    const Plug = getPlugin(scope);
    let maybe = null;
    try {
      maybe = new Plug({ ...current });
    } catch (error) {}
    return maybe;
  }, [current, scope]);

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
    <div style={{ display: 'inline-flex' }}>
      <Tooltip
        content={plug?.supported?.sync ? '同步远程数据' : '不支持同步远程数据'}
      >
        <Button
          style={{
            // paddingLeft: '8px',
            width: '32px',
          }}
          onClick={() => {
            setSyncing(true);
            if (!plug) return;
            plug.sync(current?.alias as string).finally(() => {
              setSyncing(false);
            });
          }}
          icon={<IconCloudDownload></IconCloudDownload>}
          iconOnly
          disabled={!plug?.supported?.sync}
          type="default"
          loading={syncing}
        >
          {/* &nbsp; */}
          {/* <IconSync></IconSync> */}
        </Button>
      </Tooltip>
      <Cascader
        style={{ width: '148px' }}
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
