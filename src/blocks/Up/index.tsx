import { pic } from '@/assets/svg';
import { AniSvg } from '@/blocks/AniSvg';
import { DB } from '@/db';
import { getPlugin } from '@/plugins';
import { notify } from '@/utils/notify';
import { ProcessServer, Rush } from '@/utils/rush';
import { Button, Progress, Slider, Space } from '@arco-design/web-react';
import { IconCloudDownload } from '@arco-design/web-react/icon';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../filepond.css';
import { Config } from '../Header/Config';
import { usePluginSettings } from '../Settings';

export const Up = () => {
  const { scope, current } = usePluginSettings();
  const [files, setFiles] = useState<any[]>([]);
  const [quality, setQuality] = useState(80);
  const [syncing, setSyncing] = useState(false);

  const wrapper = useRef<HTMLDivElement | null>(null);

  const plug = useMemo(() => {
    const Plug = getPlugin(scope);
    return new Plug({ ...current });
  }, [current, scope]);

  const [finished, setFinished] = useState(0);
  const count = useMemo(() => {
    return files.length || 0;
  }, [files.length]);
  console.log('plug', plug.supported);

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
        const result = await plug.upload(lite, current?.alias);
        await DB.insert(result);

        load(result.url);
        setTimeout(() => {
          setFinished((x) => x + 1);
        }, 666);
      } catch (e: any) {
        error(e.message);
      }
    },
    [current?.alias, plug],
  );

  useEffect(() => {
    if (count > 0 && finished === count) {
      notify.success('上传完成', `${count} / ${finished}`);
    }
  }, [count, finished]);

  useEffect(() => {
    setFinished(0);
    setFiles([]);
  }, []);

  return (
    <div className="rush-wrapper">
      <Space
        size="small"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Config></Config>
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
        <Button
          onClick={() => {
            setSyncing(true);
            plug.sync(current?.alias as string).finally(() => {
              setSyncing(false);
            });
          }}
          iconOnly
          disabled={!plug.supported.sync}
          type="outline"
          loading={syncing}
          icon={<IconCloudDownload></IconCloudDownload>}
        ></Button>
        <Button
          onClick={() => {
            setFinished(0);
            setFiles([]);
          }}
        >
          清空
        </Button>
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
