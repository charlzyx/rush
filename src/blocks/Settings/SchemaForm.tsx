import { Button, Form, Input, Radio, Space } from '@arco-design/web-react';
import React, { useMemo, useRef } from 'react';
import { shell } from '@tauri-apps/api';

import { PluginConfigSchemaItem } from '@/plugins/Plugin';
import { IconLaunch } from '@arco-design/web-react/icon';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const required = [{ required: true }];
export const SchemaForm = (props: {
  init?: any;
  onSubmit: (neo: any) => Promise<any>;
  onCancel: () => void;
  schema: PluginConfigSchemaItem[];
}) => {
  const formRef = useRef<any>();

  const items = useMemo(() => {
    return props.schema.map((item) => {
      const sbinit = item.dataSource
        ? {
            initialValue: item.dataSource?.[0].value,
          }
        : {};
      return (
        <FormItem
          key={item.name}
          field={item.name}
          label={item.label}
          required={item.required}
          {...sbinit}
          help={
            <div>
              {item.help}
              {item.helpLink ? (
                <IconLaunch
                  style={{ color: 'rgb(var(--primary-6))' }}
                  onClick={() => {
                    shell.open(item.helpLink!);
                  }}
                ></IconLaunch>
              ) : null}
            </div>
          }
          // initialValue={item.required ? item.dataSource?.[0].value : undefined}
          rules={item.required ? required : []}
        >
          {item.dataSource ? (
            <RadioGroup
              type="button"
              // defaultValue={item.required ? item.dataSource[0].value : null}
              options={item.dataSource}
            ></RadioGroup>
          ) : (
            <Input></Input>
          )}
        </FormItem>
      );
    });
  }, [props.schema]);

  return (
    <React.Fragment>
      <Form
        initialValues={props.init}
        ref={formRef}
        onSubmit={async (neo) => {
          return props.onSubmit(neo).then(() => {
            formRef.current?.resetFields?.();
          });
        }}
        style={{ width: '100%' }}
        autoComplete="off"
      >
        <FormItem
          field="alias"
          label="别名"
          required
          disabled={props.init?.alias}
          rules={required}
        >
          <Input />
        </FormItem>
        {items}
        <Form.Item label=" ">
          <Space size={24}>
            <Button type="primary" htmlType="submit">
              确 定
            </Button>
            <Button
              onClick={() => {
                formRef.current?.resetFields?.();
                props.onCancel();
              }}
            >
              取 消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </React.Fragment>
  );
};
