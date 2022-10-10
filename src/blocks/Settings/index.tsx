import { useStore } from '@/store';
import {
  Button,
  Card,
  Form,
  Grid,
  Input,
  Message,
  Popconfirm,
  Space,
  Table,
  TableColumnProps,
  Typography,
} from '@arco-design/web-react';
import { IconDelete, IconEdit, IconPlus } from '@arco-design/web-react/icon';
import React, { useMemo, useRef, useState } from 'react';
import { testConfig } from '@/utils/uploader';

const pick = <T extends object>(o: T, ...keys: (keyof T)[]): Partial<T> => {
  return Object.keys(o).reduce((neo: any, key) => {
    if (keys.includes(key as any)) {
      neo[key] = (o as any)[key];
    }
    return neo;
  }, {});
};

const FormItem = Form.Item;
type OSSItem = {
  alias: string;
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
  prefix: string;
  bucket: string;
  cdn?: string;
};

const CopyRender = (text: any) => {
  return (
    <Typography.Paragraph
      style={{
        marginBottom: '0',
      }}
      ellipsis
      copyable
    >
      {text}
    </Typography.Paragraph>
  );
};

const OSSList = (porps: {
  onEdit: (item: OSSItem) => void;
  setView: (view: 'list' | 'edit') => void;
}) => {
  const [ds, setDs] = useStore<OSSItem[]>('list', []);
  const [current, setCurrent] = useStore<OSSItem['alias']>('current');

  const columns: TableColumnProps[] = useMemo(
    () => [
      {
        title: '名称',
        dataIndex: 'alias',
        render(_, item) {
          const actived = item.alias === current;

          return (
            <Button
              onClick={() => {
                setCurrent(item.alias);
              }}
              size="small"
              type={actived ? 'primary' : 'text'}
            >
              {item.alias}
            </Button>
          );
        },
      },

      {
        title: 'region',
        dataIndex: 'region',
        render: CopyRender,
      },
      {
        title: 'prerfix',
        dataIndex: 'prefix',
        render: CopyRender,
      },

      {
        title: '',
        width: '100px',
        render(_, item) {
          return (
            <Space>
              <Button
                size="small"
                type="text"
                icon={<IconEdit></IconEdit>}
                onClick={() => {
                  porps.onEdit(item);
                }}
              >
                编辑!
              </Button>
              <Popconfirm
                title="要删掉这条配置吗?"
                okText="朕意已决!"
                cancelText="朕再想想"
                onOk={() => {
                  setDs((list) => {
                    const neo = list.filter((x) => x.alias !== item.alias);
                    return neo;
                  });
                }}
              >
                <Button
                  iconOnly
                  icon={<IconDelete></IconDelete>}
                  size="small"
                  type="text"
                ></Button>
              </Popconfirm>
            </Space>
          );
        },
      },
    ],
    [current, porps, setCurrent, setDs],
  );
  return (
    <React.Fragment>
      <Space
        align="end"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <Button type="text"></Button>

        <Button
          icon={<IconPlus></IconPlus>}
          onClick={() => {
            porps.setView('edit');
          }}
          type="primary"
        >
          加个配置
        </Button>
      </Space>
      <Table
        data={ds}
        size="small"
        expandedRowRender={(row) => {
          return (
            <Grid.Row>
              {Object.keys(
                pick(row, 'accessKeySecret', 'accessKeyId', 'bucket', 'cdn'),
              ).map((key) => {
                return (
                  <Grid.Col span={24 / 4} key={key}>
                    {key}:
                    <Typography.Paragraph
                      copyable
                      ellipsis={{ cssEllipsis: true, rows: 1 }}
                    >
                      {(row as any)[key]}
                    </Typography.Paragraph>
                  </Grid.Col>
                );
              })}
            </Grid.Row>
          );
        }}
        columns={columns}
        rowKey="alias"
        pagination={false}
      ></Table>
    </React.Fragment>
  );
};

const Edit = (props: { init?: OSSItem; onFinish: () => void }) => {
  const formRef = useRef<any>();
  const [ds, setDs] = useStore<OSSItem[]>('list');

  return (
    <React.Fragment>
      <Form
        initialValues={props.init}
        ref={formRef}
        onSubmit={async (neo) => {
          const ok = await testConfig(neo);
          if (!ok) {
            return Message.error('配置测试链接失败, 请检查您的配置是否正确');
          }
          const index = props.init
            ? ds.findIndex((x) => x.alias === props.init?.alias)
            : -1;

          if (index > -1) {
            setDs((list) => {
              list.splice(index, 1, neo as any);
              return [...list];
            });
          } else {
            setDs((list) => {
              list.push(neo as any);
              return [...list];
            });
          }

          formRef.current?.resetFields?.();
          props.onFinish();
        }}
        style={{ width: '100%' }}
        autoComplete="off"
      >
        <FormItem
          field="alias"
          label="别名"
          required
          rules={[
            {
              validator(value, callback) {
                if (!props.init && ds.find((x) => x.alias === value)) {
                  callback('已经存在同名的配置');
                }
              },
            },
          ]}
        >
          <Input />
        </FormItem>
        <FormItem field="accessKeyId" label="Access Key ID" required>
          <Input />
        </FormItem>
        <FormItem field="accessKeySecret" label="Access Key Secret" required>
          <Input />
        </FormItem>
        <FormItem field="region" label="Region" required>
          <Input />
        </FormItem>
        <FormItem field="prefix" label="Prefix" required>
          <Input />
        </FormItem>
        <FormItem field="bucket" label="Bucket" required>
          <Input />
        </FormItem>
        <FormItem field="cdn" label="CDN">
          <Input />
        </FormItem>
        <Form.Item label=" ">
          <Space size={24}>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
            <Button
              onClick={() => {
                formRef.current?.resetFields?.();
                props.onFinish();
              }}
            >
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </React.Fragment>
  );
};

export const Settings = () => {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [item, setItem] = useState<any>();

  return (
    <Card bordered={false}>
      {view === 'list' ? (
        <OSSList
          onEdit={(neo) => {
            setItem(neo);
            setView('edit');
          }}
          setView={setView}
        ></OSSList>
      ) : (
        <Edit
          init={item}
          onFinish={() => {
            setItem({});
            setView('list');
          }}
        ></Edit>
      )}
    </Card>
  );
};
