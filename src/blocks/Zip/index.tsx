import { pic } from '@/svg';
import { ProcessServer, Yap } from '@/utils/yap';
import {
  Button,
  Card,
  Message,
  Progress,
  Slider,
  Space,
  Typography,
} from '@arco-design/web-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './zip.css';
import { AniSvg } from '@/blocks/AniSvg';
import { TinyPlugin } from '@/plugins/Tiny';
import { DB } from '@/db';

export const Zip = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [quality, setQuality] = useState(80);
  const [optimizeMaping, setOoptimizeMaping] = useState<Record<string, number>>(
    {},
  );
  const wrapper = useRef<HTMLDivElement | null>(null);

  const plug = useMemo(() => {
    return new TinyPlugin({ quality, allowOverwrite: true });
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

      setOoptimizeMaping((old) => {
        return {
          ...old,
          [file.name]: parseFloat(((afterSize / preSize) * 100).toFixed(2)),
        };
      });

      load(result.url);
      await DB.insert(plug.name, result);
      setTimeout(() => {
        setFinished((x) => x + 1);
      }, 666);
    },
    [plug],
  );

  useEffect(() => {
    if (count > 0 && finished === count) {
      Message.success('压缩完成!');
    }
  }, [count, finished]);

  useEffect(() => {
    setFinished(0);
    setFiles([]);
  }, []);

  const fresh = () => {
    if (!wrapper.current) return;
    const list = Array.from(
      wrapper.current.querySelectorAll('.filepond--file-wrapper legend'),
    );
    list.forEach((legend) => {
      const name = legend.innerHTML;
      const ratio = optimizeMaping[name];
      const li = legend.parentElement?.parentElement;
      if (!li) return;
      const status = li.querySelector('.filepond--file-status');
      const text = status?.children?.[0];
      if (!text) return;
      const tip =
        100 - ratio > 0 ? `-${(100 - ratio).toFixed(2)}%` : '压缩中...';
      text.innerHTML = tip;
    });
  };

  fresh();

  return (
    <div>
      <Card bordered={false}>
        <Space
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
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
        className="tiny-wapper"
        style={{ position: 'relative' }}
      >
        <Yap
          stylePanelAspectRatio={'4:3'}
          files={files}
          onupdatefiles={setFiles}
          allowMultiple={true}
          server={{ process: uploading }}
          name="files"
          labelIdle={pic}
        />
        {files.length === 0 ? (
          <AniSvg name="work" opacity={0.8} className="upload-empty"></AniSvg>
        ) : null}
      </div>
    </div>
  );
};
