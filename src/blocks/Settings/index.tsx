import { Button, Radio, Space } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useCallback, useMemo, useRef, useState } from 'react';
import { SchemaForm } from './SchemaForm';
import { SchemaList } from './SchemaList';
import { useStore } from '@/store';
import { PluginKey, getPluginSchema, plugins } from '@/plugins';

export const usePluginSettings = () => {
  const [scope, setScope] = useStore<PluginKey>('config_scope', 'qiniu');
  const [allList, setAllList] = useStore<Record<string, any>>(
    'config_list',
    {},
  );
  const [allCurrent, setAllCurrent] = useStore<Record<string, any>>(
    'config_current',
    {},
  );

  const nowList = useMemo(() => {
    if (!allList?.[scope]) {
      setAllList((old) => {
        return {
          ...old,
          [scope]: [],
        };
      });
    }
    return allList?.[scope] ?? [];
  }, [scope, allList, setAllList]);

  const nowSchema = useMemo(() => {
    return getPluginSchema(scope);
  }, [scope]);

  const nowCurrent = useMemo(() => {
    return allCurrent?.[scope];
  }, [allCurrent, scope]);

  // Fresh current
  const freshCurrent = useCallback(() => {
    setAllCurrent((old) => {
      const neo = Object.keys(old).reduce((next: any, itScope: string) => {
        next[itScope] = allList?.[itScope]?.find(
          (x: any) => x.alias === old[itScope]?.alias,
        );
        return next;
      }, {});
      return neo;
    });
  }, [allList, setAllCurrent]);

  const actions = useMemo(() => {
    return {
      create(neo: any) {
        setAllList((old) => {
          const next = old[scope] ?? [];
          const index = next.findIndex((x: any) => x.alias === neo.alias);
          if (index > -1) {
            return old;
          }
          next.push(neo);
          return {
            ...old,
            [scope]: next,
          };
        });
      },
      remove(alias: string) {
        setAllList((old) => {
          const next = old[scope] ?? [];
          const index = next.findIndex((x: any) => x.alias === alias);
          if (index > -1) {
            next.splice(index, 1);
          }
          freshCurrent();
          return {
            ...old,
            [scope]: [...next],
          };
        });
      },
      update(neo: any) {
        setAllList((old) => {
          const next = old[scope] ?? [];
          const index = next.findIndex((x: any) => x.alias === neo.alias);
          if (index > -1) {
            next[index] = neo;
          }
          freshCurrent();
          return {
            ...old,
            [scope]: [...next],
          };
        });
      },
      setCurrent(alias: string, forScope?: string) {
        setAllCurrent((old) => {
          const s = forScope || scope;
          return {
            ...old,
            [s]: allList?.[s]?.find((x: any) => x.alias === alias),
          };
        });
      },
    };
  }, [allList, freshCurrent, scope, setAllCurrent, setAllList]);

  return {
    plugins,
    scope,
    setScope,
    actions,
    schema: nowSchema,
    list: nowList,
    current: nowCurrent,
    allCurrent: allCurrent,
    allList: allList,
  };
};

export function Settings() {
  const { scope, setScope, list, current, schema, actions } =
    usePluginSettings();
  const [view, setView] = useState<'list' | 'edit'>('list');
  const tmp = useRef<any>(null);

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
        <div>
          <Radio.Group
            type="button"
            value={scope}
            onChange={(s) => {
              tmp.current = null;
              setScope(s);
            }}
            options={plugins}
          ></Radio.Group>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <Button type="outline" size="small">
            {current?.alias || '配置完成后, 点击别名启用该配置'}
          </Button>
        </div>

        <Button
          icon={<IconPlus></IconPlus>}
          onClick={() => {
            tmp.current = null;
            setView('edit');
          }}
          type="primary"
        >
          加个配置
        </Button>
      </Space>
      {view === 'list' ? (
        <SchemaList
          current={current?.alias}
          onSelect={(item) => actions.setCurrent(item.alias)}
          onDelete={(item) => actions.remove(item.alias)}
          onEdit={(item) => {
            tmp.current = item;
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
          onSubmit={(neo) => {
            const act = tmp.current ? actions.update : actions.create;
            return Promise.resolve(act(neo)).then(() => {
              setView('list');
            });
          }}
          onCancel={() => {
            tmp.current = null;
            setView('list');
          }}
        ></SchemaForm>
      ) : null}
    </div>
  );
}
