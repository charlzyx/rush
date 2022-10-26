import { pic } from '@/assets/svg';
import { AniSvg } from '@/blocks/AniSvg';
import { TinyPlugin } from '@/plugins/Tiny';
import { Fs } from '@/utils/fs';
import { ProcessServer, Rush } from '@/utils/rush';
import {
  Button,
  Progress,
  Slider,
  Space,
  Tooltip,
} from '@arco-design/web-react';
import { useProgress } from '@/Progress';
import {
  IconDelete,
  IconLaunch,
  IconSettings,
} from '@arco-design/web-react/icon';
import { shell } from '@tauri-apps/api';
import { DB } from '@/db';
import { FPProps } from './fp';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../filepond.css';
import './zip.css';
import { useRafInterval } from 'ahooks';
import { useRoute } from '@/Route';

export const Zip = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [quality, setQuality] = useState(80);
  const { zip, setZip } = useProgress();
  const route = useRoute();
  const optimizeMaping = useRef<
    Record<
      string,
      {
        ratio: number;
        before: number;
        after: number;
      }
    >
  >({});
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
      console.log('zip uploading', {
        fieldName,
        file,
        metadata,
        load,
        error,
        progress,
        abort,
      });
      const preSize = file.size;
      const lite = await plug.transform(file as File);
      const afterSize = lite.size;
      const result = await plug.upload(lite, 'tiny');

      load(result.url);
      progress(true, lite.size, lite.size);
      optimizeMaping.current[file.name] = {
        ratio: parseFloat(((afterSize / preSize) * 100).toFixed(2)),
        before: preSize,
        after: afterSize,
      };

      setFinished((x) => x + 1);

      try {
        if (afterSize < preSize) {
          await DB.record({
            name: file.name,
            before: preSize,
            after: afterSize,
            create_time: +new Date(),
          });
        }
      } catch (e) {}
    },
    [plug],
  );

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
      const ratio = optimizeMaping.current?.[name || '']?.ratio;

      const text = status?.children?.[0];
      if (!text) return;
      const isFinished = text.innerHTML === '压缩完成';
      if (isFinished) {
        // console.log('text', { text, ratio });
        const tip = 100 - ratio >= 0 ? `-${(100 - ratio).toFixed(2)}%` : '';
        text.innerHTML = tip.toString();
      }
    });
  };

  useRafInterval(() => {
    fresh();
  }, 68);

  useEffect(() => {
    setZip(count === 0 ? 0 : Math.ceil((finished / count) * 100));
  }, [count, finished, setZip]);

  return (
    <div className="rush-wrapper zip">
      <Space
        size={'small'}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button.Group style={{}}>
          <Tooltip content="设置输出目录">
            <Button
              onClick={() => {
                Fs.getThenSetOuputDir();
              }}
              icon={<IconSettings></IconSettings>}
            ></Button>
          </Tooltip>
          <Button
            onClick={() => {
              shell.open(Fs.output);
            }}
            icon={<IconLaunch></IconLaunch>}
          >
            打开输出目录
          </Button>
          <Button
            onClick={() => {
              setFinished(0);
              setFiles([]);
            }}
            icon={<IconDelete></IconDelete>}
          >
            清空记录
          </Button>
        </Button.Group>
        <Slider
          style={{
            width: '240px',
            transform: 'translate3d(0, 8px, 0)',
          }}
          value={quality}
          marks={{
            80: '80%',
          }}
          onChange={(n) => setQuality(n as number)}
        ></Slider>
        <Progress
          size="small"
          steps={5}
          percent={zip}
          status={'success'}
        ></Progress>
      </Space>

      <div ref={wrapper} className="rush-workspace">
        <Rush
          {...FPProps}
          stylePanelAspectRatio={'21:9'}
          files={files}
          disabled={route.now !== '/'}
          acceptedFileTypes={['.jpg,.jpeg,.png,gif']}
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
