import { Button, Radio, Space } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useMemo, useRef, useState } from 'react';
import { SchemaForm } from './SchemaForm';
import { SchemaList } from './SchemaList';

import { AliOssPlugin } from '@/plugins/AliOss';
import { QiNiuPlugin } from '@/plugins/QiNiu';
import { useStore } from '@/store';
import { PluginKey } from './config';

const usePluginSettings = (key: PluginKey) => {
  const [now, setNow] = useState<PluginKey>('alioss');
  const [allList, setAllList] = useStore<Record<string, any>>(
    'config_list',
    {},
  );
  const [allCurrent, setAllCurrent] = useStore<Record<string, any>>(
    'config_current',
    {},
  );

  const nowList = useMemo(() => {
    if (!allList[now]) {
      setAllList((old) => {
        return {
          ...old,
          [now]: [],
        };
      });
    }
    return allList[now] ?? [];
  }, [now, allList, setAllList]);

  const nowSchema = useMemo(() => {
    return now === 'alioss'
      ? AliOssPlugin.configSchema
      : QiNiuPlugin.configSchema;
  }, [now]);

  const actions = useMemo(() => {
    return {
      create(neo: any) {
        setAllList((old) => {
          const next = old[now] ?? [];
          next.push(neo);
          return {
            ...old,
            [now]: next,
          };
        });
      },
      remove(alias: string) {
        setAllList((old) => {
          const next = old[now] ?? [];
          const index = next.findIndex((x: any) => x.alias === alias);
          if (index > -1) {
            next.splice(index, 1);
          }
          return {
            ...old,
            [now]: [...next],
          };
        });
      },
      update(neo: any) {
        setAllList((old) => {
          const next = old[now] ?? [];
          const index = next.findIndex((x: any) => x.alias === neo.alias);
          if (index > -1) {
            next[index] = neo;
          }
          return {
            ...old,
            [now]: [...next],
          };
        });
      },
      setCurrent(alias: string) {
        setAllCurrent((old) => {
          return {
            ...old,
            [now]: allList.find((x: any) => x.alias === alias),
          };
        });
      },
    };
  }, [allList, now, setAllCurrent, setAllList]);

  return {
    now,
    setNow,
    actions,
    schema: nowSchema,
    list: nowList,
    currents: allCurrent,
  };
};

export function Settings() {
  const { now, setNow, list, schema, actions } = usePluginSettings('alioss');
  const [view, setView] = useState<'list' | 'edit'>('list');
  const tmp = useRef({});

  return (
    <div
      style={{
        padding: 16,
      }}
    >
      <Space
        align="end"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Radio.Group
          type="button"
          value={now}
          onChange={setNow}
          options={['alioss', 'qiniu']}
        ></Radio.Group>

        <Button type="text"></Button>

        <Button
          icon={<IconPlus></IconPlus>}
          onClick={() => {
            setView('edit');
          }}
          type="primary"
        >
          加个配置
        </Button>
      </Space>
      {view === 'list' ? (
        <SchemaList
          onDelete={(item) => actions.remove(item.alias)}
          onEdit={() => {
            tmp.current = tmp;
            setView('edit');
          }}
          schema={schema}
          list={list}
        ></SchemaList>
      ) : null}
      {view === 'edit' ? (
        <SchemaForm
          init={{ ...tmp.current }}
          schema={schema}
          onSubmit={list}
          onCancel={() => {
            setView('list');
          }}
        ></SchemaForm>
      ) : null}
    </div>
  );
}
