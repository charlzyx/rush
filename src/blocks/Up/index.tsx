import { pic } from '@/assets/svg';
import { AniSvg } from '@/blocks/AniSvg';
import { DB } from '@/db';
import { getPlugin, plugins } from '@/plugins';
import { ProcessServer, Rush } from '@/utils/rush';
import {
  Button,
  Card,
  Notification,
  Progress,
  Radio,
  Slider,
  Space,
  Typography,
} from '@arco-design/web-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePluginSettings } from '../Settings';
import './up.css';

const RadioGroup = Radio.Group;

export const Up = () => {
  const { scope, setScope, current } = usePluginSettings();
  const [files, setFiles] = useState<any[]>([]);
  const [quality, setQuality] = useState(80);

  const wrapper = useRef<HTMLDivElement | null>(null);

  const plug = useMemo(() => {
    const Plug = getPlugin(scope);
    return new Plug({ ...current });
  }, [current, scope]);

  const [finished, setFinished] = useState(0);
  const count = useMemo(() => {
    return files.length || 0;
  }, [files.length]);

  const uploading: ProcessServer = useCallback(
    async (
      fieldName,
      file,
      metadata,
      load,
      error,
      progress,
      abort,
      transfer,
    ) => {
      if (!plug) return;
      try {
        const lite = await plug.transform(file as File);
        const result = await plug.upload(lite);
        await DB.insert(plug.name, result);

        load(result.url);
        setTimeout(() => {
          setFinished((x) => x + 1);
        }, 666);
      } catch (e: any) {
        error(e.message);
      }
    },
    [plug],
  );

  useEffect(() => {
    if (count > 0 && finished === count) {
      Notification.success({
        title: '上传完成!',
        content: `${count} / ${finished}`,
      });
    }
  }, [count, finished]);

  useEffect(() => {
    setFinished(0);
    setFiles([]);
  }, []);

  return (
    <div>
      <Card bordered={false}>
        <Space
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <RadioGroup
            type="button"
            value={scope}
            onChange={setScope}
            options={plugins}
          ></RadioGroup>

          <Space direction="vertical" style={{ flex: 1 }}>
            <Typography.Text bold>&nbsp;&nbsp;&nbsp; 压缩质量</Typography.Text>
            <Slider
              style={{ width: '400px' }}
              value={quality}
              marks={{
                80: '80%',
              }}
              onChange={(n) => setQuality(n as number)}
            ></Slider>
          </Space>
          <Progress
            size="small"
            steps={5}
            percent={count === 0 ? 0 : Math.ceil((finished / count) * 100)}
            status={'success'}
          ></Progress>
          <Button
            onClick={() => {
              setFinished(0);
              setFiles([]);
            }}
          >
            清空
          </Button>
        </Space>
      </Card>

      <div ref={wrapper} style={{ position: 'relative' }}>
        <Rush
          stylePanelAspectRatio={'4:3'}
          files={files}
          onupdatefiles={setFiles}
          allowMultiple={true}
          server={{ process: uploading }}
          name="files"
          labelIdle={pic}
        />
        {files.length === 0 ? (
          <AniSvg name="task" opacity={0.8} className="upload-empty"></AniSvg>
        ) : null}
      </div>
    </div>
  );
};
