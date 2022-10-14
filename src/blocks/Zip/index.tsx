import { pic } from '@/assets/svg';
import { AniSvg } from '@/blocks/AniSvg';
import { TinyPlugin } from '@/plugins/Tiny';
import { Fs } from '@/utils/fs';
import { notify } from '@/utils/notify';
import { ProcessServer, Rush } from '@/utils/rush';
import {
  Button,
  Progress,
  Slider,
  Space,
  Tooltip,
} from '@arco-design/web-react';
import {
  IconDelete,
  IconLaunch,
  IconSettings,
} from '@arco-design/web-react/icon';
import { shell } from '@tauri-apps/api';
import { useRafInterval } from 'ahooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../filepond.css';
import './zip.css';

export const Zip = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [quality, setQuality] = useState(80);
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
      const preSize = file.size;
      const lite = await plug.transform(file as File);
      const afterSize = lite.size;
      const result = await plug.upload(lite, 'tiny');

      optimizeMaping.current[file.name] = {
        ratio: parseFloat(((afterSize / preSize) * 100).toFixed(2)),
        before: preSize,
        after: afterSize,
      };

      load(result.url);
      setTimeout(() => {
        setFinished((x) => x + 1);
      }, 666);
    },
    [plug],
  );

  useEffect(() => {
    if (count > 0 && finished === count) {
      const map = optimizeMaping.current;
      const info = Object.keys(map).reduce(
        (yyds, name) => {
          yyds.before += map[name]?.before || 0;
          yyds.after += map[name]?.after || 0;
          return yyds;
        },
        { before: 0, after: 0 },
      );
      const before = `${(info.before / 1024).toFixed(2)} KB`;
      const after = `${(info.after / 1024).toFixed(2)} KB`;
      const ratio = ((info.after / info.before) * 100).toFixed(2);
      notify.success('压缩完成', `${before} ~> ${after} -${ratio}%`);
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
      const ratio = optimizeMaping.current?.[name || '']?.ratio;

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
          percent={count === 0 ? 0 : Math.ceil((finished / count) * 100)}
          status={'success'}
        ></Progress>
      </Space>

      <div ref={wrapper} className="rush-workspace">
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
          <AniSvg name="task" opacity={0.8} className="task-empty"></AniSvg>
        ) : null}
      </div>
    </div>
  );
};
