import { pic } from '@/assets/svg';
import { AniSvg } from '@/blocks/AniSvg';
import { Fs } from '@/plugins/fs';
import { TinyPlugin } from '@/plugins/Tiny';
import { ProcessServer, Rush } from '@/utils/rush';
import {
  Button,
  Card,
  Notification,
  Progress,
  Slider,
  Space,
  Typography,
} from '@arco-design/web-react';
import { IconFolder } from '@arco-design/web-react/icon';
import { shell } from '@tauri-apps/api';
import { useRafInterval } from 'ahooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './zip.css';

export const Zip = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [quality, setQuality] = useState(80);
  const optimizeMaping = useRef<Record<string, number>>({});
  const wrapper = useRef<HTMLDivElement | null>(null);

  const plug = useMemo(() => {
    return new TinyPlugin({ quality });
  }, [quality]);

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
      const preSize = file.size;
      const lite = await plug.transform(file as File);
      const afterSize = lite.size;
      const result = await plug.upload(lite);

      optimizeMaping.current[file.name] = parseFloat(
        ((afterSize / preSize) * 100).toFixed(2),
      );

      load(result.url);
      setTimeout(() => {
        setFinished((x) => x + 1);
      }, 666);
    },
    [plug],
  );

  useEffect(() => {
    if (count > 0 && finished === count) {
      Notification.success({
        title: '压缩完成!',
        content: `${count} / ${finished}`,
      });
    }
  }, [count, finished]);

  useEffect(() => {
    setFinished(0);
    setFiles([]);
  }, []);

  const fresh = () => {
    if (!wrapper.current) return;
    const list = Array.from(
      wrapper.current.querySelectorAll('.filepond--file-status'),
    );
    list.forEach((status) => {
      const legend = status.parentElement?.parentElement?.querySelector(
        '.filepond--file-wrapper legend',
      );
      const name = legend?.innerHTML;
      const ratio = optimizeMaping.current?.[name || ''];

      const text = status?.children?.[0];
      if (!text) return;
      const tip = 100 - ratio > 0 ? `-${(100 - ratio).toFixed(2)}%` : '';
      if (tip) {
        text.setAttribute('data-tiny', tip);
      }

      text.innerHTML = tip;
    });
  };

  useRafInterval(() => {
    fresh();
  }, 123);

  return (
    <div>
      <Card bordered={false}>
        <Space
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button
            onClick={() => {
              shell.open(Fs.output);
            }}
            size="small"
            icon={<IconFolder></IconFolder>}
            type="outline"
          >
            打开输出录
          </Button>
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

      <div
        ref={wrapper}
        className="tiny-wrapper"
        style={{ position: 'relative' }}
      >
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
