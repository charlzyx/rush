import { pic } from '@/assets/svg';
import { AniSvg } from '@/blocks/AniSvg';
import { DB } from '@/db';
import { getPlugin } from '@/plugins';
import { useProgress } from '@/Progress';
import { useRoute } from '@/Route';
import { ProcessServer, Rush } from '@/utils/rush';
import { Button, Progress, Slider, Space } from '@arco-design/web-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../filepond.css';
import { Config } from '../Header/Config';
import { usePluginSettings } from '../Settings';
import { useAnalyzer } from '../useAnalyzer';
import { FPProps } from './fp';
import { uniquName } from '@/utils';

export const Up = () => {
  const { scope, current } = usePluginSettings();
  const [files, setFiles] = useState<any[]>([]);
  const [quality, setQuality] = useState(80);
  const { up, setUp } = useProgress();
  const route = useRoute();

  const wrapper = useRef<HTMLDivElement | null>(null);
  const { refs, updateDOM, clear } = useAnalyzer({
    wrapper,
    finishedText: FPProps.labelFileProcessingComplete,
  });

  const reset = useCallback(() => {
    setFinished(0);
    setFiles([]);
    clear();
  }, [clear]);

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
        let lite = await plug.transform(file as File);
        const afterSize = lite.size;
        const result = await plug.upload(lite, current?.alias);
        await DB.insert(result);
        // 根据原始名字获取id
        const fileId = refs.current.ids[file.name];
        refs.current.map[fileId] = {
          ratio: parseFloat(((afterSize / preSize) * 100).toFixed(2)),
          before: preSize,
          after: afterSize,
        };

        load(result.url);
        setFinished((x) => x + 1);
        if (afterSize < preSize) {
          DB.record({
            before: preSize,
            after: afterSize,
            name: lite.name,
            create_time: +new Date(),
          });
        }
      } catch (e: any) {
        error(e.message);
      }
    },
    [current?.alias, plug, refs],
  );

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateDOM();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

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
              clear();
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
          disabled={route.now !== 'up'}
          stylePanelAspectRatio={'21:9'}
          files={files}
          onprocessfiles={() => {
            updateDOM();
          }}
          onerror={() => {
            updateDOM();
          }}
          onprocessfileabort={() => {
            updateDOM();
          }}
          onupdatefiles={(list) => {
            list.forEach((item) => {
              refs.current.ids[item.file.name] = item.id;
            });
            setFiles(list);
          }}
          fileRenameFunction={({ name, basename, extension }) => {
            const fileName = uniquName(refs.current.ids, basename, extension);
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
