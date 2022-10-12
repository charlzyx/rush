import { PluginConfigSchemaItem } from '@/plugins/Plugin';
import {
  Button,
  Grid,
  Popconfirm,
  Space,
  Table,
  TableColumnProps,
  Typography,
} from '@arco-design/web-react';
import { IconDelete, IconEdit } from '@arco-design/web-react/icon';
import React, { useMemo } from 'react';

const LongText = (props: { children: string }) => {
  return (
    <Typography.Title
      style={{
        color: 'var(--color-text-1)',
      }}
      ellipsis={{
        cssEllipsis: true,
        showTooltip: true,
        rows: 1,
      }}
      copyable
      heading={8 as any}
    >
      {props.children}
    </Typography.Title>
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
                <LongText>{text}</LongText>
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
                    <Typography.Paragraph
                      copyable
                      ellipsis={{ cssEllipsis: true, rows: 1 }}
                    >
                      {dataSource
                        ? dataSource.find((x) => x.value == v)?.label
                        : v}
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