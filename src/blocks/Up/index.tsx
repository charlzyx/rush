import { pic } from '@/assets/svg';
import { AniSvg } from '@/blocks/AniSvg';
import { DB } from '@/db';
import { getPlugin } from '@/plugins';
import { useProgress } from '@/Progress';
import { useRoute } from '@/Route';
import { ProcessServer, Rush } from '@/fp';
import { Button, Slider, Space } from '@arco-design/web-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../filepond.css';
import { Config } from '../Header/Config';
import { usePluginSettings } from '../Settings';
import { FPProps } from './fp';
import { uniquName } from '@/utils';
import { NumberEasing } from '../NumberEasing';

export const Up = () => {
  const { scope, current } = usePluginSettings();
  const [files, setFiles] = useState<any[]>([]);
  const [quality, setQuality] = useState(80);
  const { setUp } = useProgress();
  const route = useRoute();

  const wrapper = useRef<HTMLDivElement | null>(null);

  const reset = useCallback(() => {
    setFinished(0);
    setFiles([]);
  }, []);

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
        const {
          tiny: { before, after },
        } = metadata;
        const result = await plug.upload(file as File, current?.alias);
        await DB.insert(result);
        load(result.url);
        setFinished((x) => x + 1);
        if (after < before) {
          DB.record({
            before,
            after,
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
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              reset();
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
        <NumberEasing value={finished} count={count}></NumberEasing>

        {/* <Progress
          percent={finished}
          formatText={(val) => `${val} / ${count}`}
          color="rgb(var(--primary-6))"
        ></Progress> */}
      </Space>

      <div ref={wrapper} className="rush-workspace">
        <Rush
          {...FPProps}
          disabled={route.now !== 'up'}
          stylePanelAspectRatio={'21:9'}
          files={files}
          onupdatefiles={setFiles}
          fileRenameFunction={({ name, basename, extension }) => {
            const map = files
              .map((item) => item.name)
              .reduce((m, k) => {
                m[k] = true;
                return m;
              }, {});
            const fileName = uniquName(map, basename, extension);
            return fileName;
          }}
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
