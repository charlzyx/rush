import { Button, Form, Input, Radio, Space } from '@arco-design/web-react';
import React, { useEffect, useMemo, useRef } from 'react';

import { PluginConfigSchemaItem } from '@/plugins/Plugin';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

export const SchemaForm = (props: {
  init?: any;
  onSubmit: (neo: any) => Promise<any>;
  onCancel: () => void;
  schema: PluginConfigSchemaItem[];
}) => {
  const formRef = useRef<any>();

  const items = useMemo(() => {
    return props.schema.map((item) => {
      return (
        <FormItem field={item.name} label={item.label} required>
          {item.dataSource ? (
            <RadioGroup
              type="button"
              defaultValue={item.required ? item.dataSource[0].value : null}
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
