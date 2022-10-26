import { pic } from '@/assets/svg';
import { AniSvg } from '@/blocks/AniSvg';
import { DB } from '@/db';
import { getPlugin } from '@/plugins';
import { useProgress } from '@/Progress';
import { ProcessServer, Rush } from '@/utils/rush';
import { Button, Progress, Slider, Space } from '@arco-design/web-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../filepond.css';
import { Config } from '../Header/Config';
import { usePluginSettings } from '../Settings';
import { FPProps } from './fp';

export const Up = () => {
  const { scope, current } = usePluginSettings();
  const [files, setFiles] = useState<any[]>([]);
  const [quality, setQuality] = useState(80);
  const { up, setUp } = useProgress();

  const wrapper = useRef<HTMLDivElement | null>(null);

  const plug = useMemo(() => {
    const Plug = getPlugin(scope);
    let maybe = null;
    try {
      maybe = new Plug({ ...current });
    } catch (error) {}
    return maybe;
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
        const preSize = file.size;
        const lite = await plug.transform(file as File);
        const afterSize = lite.size;
        const result = await plug.upload(lite, current?.alias);
        await DB.insert(result);

        load(result.url);
        setFinished((x) => x + 1);
        if (afterSize < preSize) {
          DB.record({
            before: preSize,
            after: afterSize,
            name: file.name,
            create_time: +new Date(),
          });
        }
      } catch (e: any) {
        error(e.message);
      }
    },
    [current?.alias, plug],
  );

  useEffect(() => {
    setFinished(0);
    setFiles([]);
  }, []);

  useEffect(() => {
    setUp(count === 0 ? 0 : Math.ceil((finished / count) * 100));
  }, [count, finished, setUp]);

  return (
    <div className="rush-wrapper">
      <Space
        size="small"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button.Group>
          <Config></Config>
          <Button
            onClick={() => {
              setFinished(0);
              setFiles([]);
            }}
          >
            清空记录
          </Button>
        </Button.Group>
        <Slider
          style={{ width: '240px', transform: 'translate3d(0, 8px, 0)' }}
          value={quality}
          marks={{
            80: '80%',
          }}
          onChange={(n) => setQuality(n as number)}
        ></Slider>
        <Progress
          size="small"
          steps={5}
          percent={up}
          color="rgb(var(--primary-6))"
        ></Progress>
      </Space>

      <div ref={wrapper} className="rush-workspace">
        <Rush
          {...FPProps}
          stylePanelAspectRatio={'21:9'}
          files={files}
          onupdatefiles={setFiles}
          allowMultiple={true}
          server={{ process: uploading }}
          name="files"
          labelIdle={pic}
        />
        {files.length === 0 ? (
          <AniSvg name="task" opacity={0.8} className="task-empty"></AniSvg>
        ) : null}
      </div>
    </div>
  );
};
