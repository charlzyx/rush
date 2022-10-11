import { AniSvg } from '@/blocks/AniSvg';
import { DB } from '@/db';
import { StoreItem } from '@/shared/http';
import { useStore } from '@/store';
import {
  Button,
  DatePicker,
  Grid,
  Input,
  Pagination,
  Radio,
} from '@arco-design/web-react';
import {
  IconFullscreen,
  IconFullscreenExit,
  IconImage,
  IconMosaic,
  IconRefresh,
  IconSave,
  IconSend,
} from '@arco-design/web-react/icon';
import { useDebounce, useSize } from 'ahooks';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Item } from './Item';

const Row = Grid.Row;
const Col = Grid.Col;

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

const useResponsiveSize = () => {
  const size = useSize(document.body);
  const w = (size?.width || window.document.body.clientWidth) - 32;
  const h = size?.height || window.document.body.clientHeight - 80;

  const width = useDebounce(w, { wait: 100, leading: true, trailing: true });
  const height = useDebounce(h, { wait: 100, leading: true, trailing: true });

  const [col, setCol] = useState(computedCol(width));

  const unit = useMemo(() => {
    return width / col;
  }, [col, width]);

  const lazyUnit = useDebounce(unit, {
    wait: 96,
    leading: true,
    trailing: true,
  });

  const row = useMemo(() => {
    return Math.floor(height / lazyUnit);
  }, [height, lazyUnit]);

  const pageSize = useMemo(() => {
    return col * row;
  }, [col, row]);

  useEffect(() => {
    const nextCol = computedCol(width);
    if (nextCol !== col) {
      setCol(nextCol);
    }
  }, [col, width]);

  return { col, row, unit: lazyUnit, pageSize };
};

export const History = () => {
  const [query, setQuery] = useState({
    scope: 'tiny' as 'alioss' | 'tiny',
    list: [] as StoreItem[],
    kw: '',
    dateRange: [] as string[],
  });

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

  const lazyKw = useDebounce(query.kw, { trailing: true, wait: 233 });
  const { col, row, unit, pageSize } = useResponsiveSize();

  const groups = useMemo(() => {
    return list.reduce((arr, item, idx) => {
      const groupIdx = Math.floor(idx / col);
      arr[groupIdx] = arr[groupIdx] || [];
      arr[groupIdx].push(item);
      return arr;
    }, [] as StoreItem[][]);
  }, [col, list]);

  useEffect(() => {
    setPage((x) => {
      return { ...x, pageSize };
    });
  }, [pageSize]);

  const load = useCallback(() => {
    if (!DB.db) return;

    setState((x) => {
      return {
        ...x,
        loading: true,
      };
    });
    DB.query(query.scope, {
      pageNumber: page.current,
      pageSize: page.pageSize,
      kw: lazyKw,
      startTime: query.dateRange[0]
        ? dayjs(query.dateRange[0]).unix()
        : undefined,
      endTime: query.dateRange[1]
        ? dayjs(query.dateRange[1]).unix()
        : undefined,
    })
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
  }, [setState, query.scope, query.dateRange, page, lazyKw]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page.pageSize, page.current, lazyKw]);

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
        <div style={{ display: 'flex' }}>
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
          <RadioGroup
            value={state.blur ? 'true' : 'false'}
            onChange={(v) => setState((x) => ({ ...x, blur: v === 'true' }))}
            type="button"
            defaultValue="true"
          >
            <Radio value="true">
              <IconMosaic></IconMosaic>
            </Radio>
            <Radio value="false">
              <IconImage></IconImage>
            </Radio>
          </RadioGroup>
          <span>&nbsp;&nbsp;</span>
          <RadioGroup
            value={query.scope}
            onChange={(v) => setQuery((x) => ({ ...x, scope: v }))}
            type="button"
            defaultValue="tiny"
          >
            <Radio value="tiny">
              <IconSave></IconSave>
            </Radio>
            <Radio value="alioss">
              <IconSend></IconSend>
            </Radio>
          </RadioGroup>
          <span>&nbsp;&nbsp;</span>
          <div>
            <Input
              value={query.kw}
              style={{ width: '100px' }}
              onChange={(v) => setQuery((x) => ({ ...x, kw: v }))}
              placeholder="搜索"
            ></Input>
          </div>
          <span>&nbsp;&nbsp;</span>
          <div>
            <DatePicker.RangePicker
              value={query.dateRange}
              style={{ width: '240px' }}
              onChange={(v) => setQuery((x) => ({ ...x, dateRange: v }))}
            ></DatePicker.RangePicker>
          </div>
        </div>
        <div>
          <Button
            onClick={() => {
              load();
            }}
            type="outline"
            icon={<IconRefresh></IconRefresh>}
          >
            {col} x {row} 刷新
          </Button>
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          marginRight: '-16px',
          flex: 1,
        }}
      >
        {groups.map((group, idx) => {
          return (
            <Row
              key={idx}
              gutter={{ md: 16, lg: 16, xl: 16 }}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              {group.map((item) => {
                return (
                  <Col key={item.name + item.create_time} span={24 / col}>
                    <Item
                      blur={state.blur ? 6 : 0}
                      fit={state.fit}
                      key={item.create_time + item.name}
                      unit={unit - 16}
                      data={item}
                    ></Item>
                  </Col>
                );
              })}
            </Row>
          );
        })}
        {list.length === 0 ? (
          <AniSvg
            style={{
              width: '80%',
              height: '80%',
            }}
            name="wait"
            opacity={0.8}
          ></AniSvg>
        ) : (
          <AniSvg
            name="wait"
            abs
            visible={state.loading}
            opacity={0.8}
          ></AniSvg>
        )}
      </div>
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          WebkitBackdropFilter: 'blur(4px)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <Pagination
          current={page.current}
          pageSize={page.pageSize}
          onChange={(n) =>
            setPage((x) => {
              console.log('x', x, n);
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
  );
};
