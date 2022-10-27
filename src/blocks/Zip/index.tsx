import { pic } from '@/assets/svg';
import { AniSvg } from '@/blocks/AniSvg';
import { TinyPlugin } from '@/plugins/Tiny';
import { Fs } from '@/utils/fs';
import { ProcessServer, Rush } from '@/fp';
import { Button, Slider, Space, Tooltip } from '@arco-design/web-react';
import { useProgress } from '@/Progress';
import {
  IconDelete,
  IconLaunch,
  IconSettings,
} from '@arco-design/web-react/icon';
import { shell } from '@tauri-apps/api';
import { DB } from '@/db';
import { FPProps } from './fp';
import { useCallback, useEffect, useMemo, useState } from 'react';
import '../filepond.css';
import './zip.css';
import { useRoute } from '@/Route';
import { TINY_SUPPORTE } from '@/plugins/config';
import { uniquName } from '@/utils';
import { NumberEasing } from '../NumberEasing';

export const Zip = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [quality, setQuality] = useState(80);
  const { setZip } = useProgress();
  const route = useRoute();

  const plug = useMemo(() => {
    return new TinyPlugin({ quality });
  }, [quality]);

  const [finished, setFinished] = useState(0);
  const count = useMemo(() => {
    return files.length || 0;
  }, [files.length]);

  const reset = useCallback(() => {
    setFinished(0);
    setFiles([]);
  }, []);

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
      const {
        tiny: { before, after },
      } = metadata;
      const result = await plug.upload(file as File, 'tiny');

      load(result.url);
      setFinished((x) => x + 1);

      try {
        if (after < before) {
          await DB.record({
            name: file.name,
            before: before,
            after: after,
            create_time: +new Date(),
          });
        }
      } catch (e) {}
    },
    [plug],
  );

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              reset();
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
        <NumberEasing value={finished} count={count}></NumberEasing>
        {/* <Progress
          percent={finished}
          formatText={(val) => `${val} / ${count}`}
          status={'success'}
        ></Progress> */}
      </Space>

      <div className="rush-workspace">
        <Rush
          {...FPProps}
          stylePanelAspectRatio={'21:9'}
          files={files}
          tinyQuality={quality}
          disabled={route.now !== '/'}
          beforeAddFile={(item) => {
            return TINY_SUPPORTE.test(item.fileType);
          }}
          beforeDropFile={(item) => {
            return typeof item === 'string'
              ? true
              : TINY_SUPPORTE.test(item.fileType);
          }}
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
