import { PluginConfigSchemaItem } from '@/plugins/Plugin';
import {
  Button,
  Grid,
  Message,
  Popconfirm,
  Space,
  Table,
  TableColumnProps,
} from '@arco-design/web-react';
import { IconCopy, IconDelete, IconEdit } from '@arco-design/web-react/icon';
import React, { useMemo } from 'react';
import copy from '@arco-design/web-react/es/_util/clipboard';

export const Copy = (props: { text: string }) => {
  return (
    <Button
      type="text"
      style={{
        textAlign: 'start',
        color: 'var(--color-text-1)',
        width: '180px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      }}
      onClick={(e) => {
        e.stopPropagation();
        copy(props.text).then(() => {
          Message.success({
            content: `已复制 ${props.text}`,
            duration: 300,
          });
        });
      }}
      size="small"
      icon={<IconCopy></IconCopy>}
    >
      {props.text}
    </Button>
  );
};

export const SchemaList = (props: {
  list: any[];
  current: string;
  onSelect: (item: any) => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  schema: PluginConfigSchemaItem[];
}) => {
  const columns: TableColumnProps[] = useMemo(() => {
    const schemas = props.schema
      .map((item) => {
        return {
          title: item.label,
          dataIndex: item.name,
          render: (v: any) => {
            const text = item.dataSource
              ? item.dataSource!.find((x: any) => x.value == v)?.label
              : v;
            return (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Copy text={text}></Copy>
              </div>
            );
          },
        };
      })
      .slice(0, 2);

    return [
      {
        title: '别名',
        dataIndex: 'alias',
        width: '100px',
        render(alias, item) {
          return (
            <Button
              size="small"
              type={alias === props.current ? 'primary' : 'text'}
              onClick={() => {
                props.onSelect(item);
              }}
            >
              {alias}
            </Button>
          );
        },
      },
      ...schemas,
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
                  props.onEdit(item);
                }}
              >
                编辑!
              </Button>
              <Popconfirm
                title="要删掉这条配置吗?"
                okText="朕意已决!"
                cancelText="朕再想想"
                onOk={() => {
                  return props.onDelete(item);
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
    ];
  }, [props]);

  return (
    <React.Fragment>
      <Table
        data={props.list}
        size="small"
        expandedRowRender={(row) => {
          return (
            <Grid.Row>
              {props.schema.map((item) => {
                const { name: key, dataSource } = item;
                const v = row[key];
                return (
                  <Grid.Col span={24 / 4} key={key}>
                    {key}:
                    <Copy
                      text={
                        dataSource
                          ? dataSource.find((x) => x.value == v)?.label
                          : v
                      }
                    ></Copy>
                    {/* <Typography.Paragraph
                      copyable
                      ellipsis={{ cssEllipsis: true, rows: 1 }}
                    ></Typography.Paragraph> */}
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
