import { AniSvg } from '@/blocks/AniSvg';
import { DB } from '@/db';
import { StoreItem } from '@/shared/typings';
import { useStore } from '@/store';
import {
  Button,
  DatePicker,
  Input,
  Pagination,
  Radio,
  Tooltip,
} from '@arco-design/web-react';
import {
  IconCloudDownload,
  IconFullscreen,
  IconFullscreenExit,
  IconRefresh,
  IconSave,
  IconStorage,
} from '@arco-design/web-react/icon';
import { useDebounce, useLatest, useSize, useThrottle } from 'ahooks';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePluginSettings } from '../Settings';
import { Config } from '../Header/Config';
import { Box } from './Box';
import { getPlugin } from '@/plugins';

const RadioGroup = Radio.Group;

const xInRange = (x: number, range: [number, number]) => {
  return x >= range[0] && x < range[1];
};

const computedCol = (x: number) => {
  const isSmall = xInRange(x, [0, 600]);
  const isMiddle = xInRange(x, [600, 960]);
  const isLarge = xInRange(x, [960, 1400]);
  const isMax = xInRange(x, [1400, Number.MAX_VALUE]);
  return isSmall ? 3 : isMiddle ? 4 : isLarge ? 6 : isMax ? 8 : 4;
};

const bodyWH = () => {
  return {
    w: window.document.body.clientWidth,
    h: window.document.body.clientHeight,
  };
};

const useResponsiveSize = (wrapperRef: { current: HTMLDivElement | null }) => {
  const size = useSize(wrapperRef.current);
  const rect = wrapperRef.current?.getBoundingClientRect?.();

  const w = size?.width || rect?.width || bodyWH().w;
  const h = size?.height || rect?.height || bodyWH().h;

  const width = useThrottle(w, { wait: 100 });
  const height = useThrottle(h, { wait: 100 });

  const [col, setCol] = useState(computedCol(width));

  const unit = useMemo(() => {
    if (wrapperRef.current) {
      const td = wrapperRef.current.querySelector('td');
      if (td) {
        return td.getBoundingClientRect().height;
      } else {
        return width / col;
      }
    }
    return width / col;
  }, [col, width, wrapperRef]);

  const row = useMemo(() => {
    const easy = Math.floor(height / unit);
    if (!rect) {
      return easy;
    }
    // 下面分页的高度
    const BOTTOMOFFSET = 48;
    const wanted = bodyWH().h - rect.top - BOTTOMOFFSET;
    if (rect.height > wanted) {
      return Math.floor(wanted / unit);
    } else {
      return easy;
    }
  }, [height, rect, unit]);

  const pageSize = useDebounce(col * row, {
    wait: 200,
    leading: true,
    trailing: true,
  });

  useEffect(() => {
    const nextCol = computedCol(width);
    if (nextCol !== col) {
      setCol(nextCol);
    }
  }, [col, width]);
  // console.log({ col, row, x: (height / unit).toFixed(2), width, height, unit });

  return { col, row, pageSize };
};

export const History = () => {
  const { scope, current } = usePluginSettings();
  const [query, setQuery] = useState({
    list: [] as StoreItem[],
    kw: '',
    dateRange: [] as string[],
  });

  const plug = useMemo(() => {
    const Plug = getPlugin(scope);
    let maybe = null;
    try {
      maybe = new Plug({ ...current });
    } catch (error) {}
    return maybe;
  }, [current, scope]);

  const [list, setList] = useState<StoreItem[]>([]);

  const [page, setPage] = useState({
    total: 0,
    current: 1,
    pageSize: 10,
  });

  const [state, setState] = useStore('history_state', {
    loading: false,
    blur: false,
    fit: 'cover' as 'cover' | 'contain',
  });

  const lazyLoading = useThrottle(state.loading, {
    wait: 128,
    trailing: true,
    leading: true,
  });

  const lazyKw = useDebounce(query.kw, { trailing: true, wait: 233 });
  const wrapper = useRef<HTMLDivElement | null>(null);
  const { col, pageSize } = useResponsiveSize(wrapper);

  const rows = useMemo(() => {
    return list.reduce((arr, item, idx) => {
      const groupIdx = Math.floor(idx / col);
      arr[groupIdx] = arr[groupIdx] || [];
      arr[groupIdx].push(item);
      return arr;
    }, [] as StoreItem[][]);
  }, [col, list]);

  const lazyPage = useDebounce(pageSize, { wait: 233 });

  useEffect(() => {
    setPage((x) => {
      return { ...x, pageSize: lazyPage };
    });
  }, [lazyPage]);

  const params = useLatest({
    scope,
    alias: current?.alias,
    pageNumber: page.current,
    pageSize: page.pageSize,
    kw: lazyKw,
    startTime: query.dateRange?.[0]
      ? +dayjs(query.dateRange[0]).startOf('day')
      : undefined,
    endTime: query.dateRange?.[1]
      ? +dayjs(query.dateRange[1]).endOf('day')
      : undefined,
  });

  const load = useCallback(() => {
    if (!DB.db) return;
    // if (auto && page.total > 0 && page.total < params.current.pageSize) return;

    setState((x) => {
      return {
        ...x,
        loading: true,
      };
    });

    DB.query(params.current)
      .then((data) => {
        setList(data.list as StoreItem[]);
        setPage((x) => {
          return {
            ...x,
            total: data.total,
          };
        });
      })
      .finally(() => {
        setState((x) => {
          return {
            ...x,
            loading: false,
          };
        });
      });
  }, [params, setState]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page.pageSize, page.current, lazyKw, scope, current?.alias]);

  return (
    <div
      style={{
        height: '100%',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
          }}
        >
          <Config></Config>
          <span>&nbsp;&nbsp;</span>
          <div>
            <Input
              value={query.kw}
              onChange={(v) => setQuery((x) => ({ ...x, kw: v }))}
              placeholder="搜索"
            ></Input>
          </div>
          <span>&nbsp;&nbsp;</span>
          <div>
            <DatePicker.RangePicker
              value={query.dateRange}
              style={{ width: '240px' }}
              onChange={(v) => {
                setQuery((x) => ({ ...x, dateRange: v }));
              }}
            ></DatePicker.RangePicker>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <Button.Group>
            <Tooltip content="查看本地 sqlite">
              <Button
                onClick={() => {
                  DB.open();
                }}
                // type="outline"
                icon={<IconStorage></IconStorage>}
              ></Button>
            </Tooltip>

            <Button
              onClick={() => {
                load();
              }}
              // type="outline"
              loading={lazyLoading}
              icon={<IconRefresh></IconRefresh>}
            >
              刷新
            </Button>
          </Button.Group>
        </div>
      </div>
      <div
        ref={wrapper}
        style={{
          position: 'relative',
          flex: 1,
          flexGrow: 1,
          height: '100%',
        }}
      >
        <table
          style={{
            width: '100%',
          }}
        >
          <tbody>
            {rows.map((group, idx) => {
              return (
                <tr key={idx}>
                  {group.map((item) => {
                    return (
                      <td
                        width={`${(100 / col).toFixed(2)}%`}
                        key={item.name + item.create_time}
                      >
                        <Box
                          fit={state.fit}
                          key={item.create_time + item.name}
                          remoteRemove={plug?.supported?.remove}
                          onRemove={() => {
                            if (!plug) return;
                            return plug.remove(item).then(() => {
                              load();
                            });
                          }}
                          data={item}
                        ></Box>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 ? (
          <AniSvg abs name="wait" opacity={0.8}></AniSvg>
        ) : null}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: list.length === 0 ? '16px' : 0,
        }}
      >
        <div style={{ display: 'flex', flex: 1 }}>
          <RadioGroup
            value={state.fit}
            onChange={(v) => setState((x) => ({ ...x, fit: v }))}
            type="button"
            defaultValue="cover"
          >
            <Radio value="cover">
              <IconFullscreen></IconFullscreen>
            </Radio>
            <Radio value="contain">
              <IconFullscreenExit></IconFullscreenExit>
            </Radio>
          </RadioGroup>
          <span>&nbsp;&nbsp;</span>
        </div>
        <div>
          <Pagination
            current={page.current}
            showTotal={(total, range) => (
              <span>{`第 ${range[0]}-${range[1]} 条/总共 ${total} 条`}</span>
            )}
            pageSize={page.pageSize}
            onChange={(n) =>
              setPage((x) => {
                return {
                  ...x,
                  current: n,
                };
              })
            }
            simple
            total={page.total}
          ></Pagination>
        </div>
      </div>
    </div>
  );
};
