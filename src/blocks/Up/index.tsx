import { charsIndex, useConfig } from '@/store';
import { useClient } from '@/utils/uploader';
import { ProcessServer, Yap } from '@/utils/yap';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Message,
  Progress,
  Slider,
  Space,
  Typography,
} from '@arco-design/web-react';
import { pic } from '@/svg';
import dayjs from 'dayjs';
import './up.css';
import tiny from '@mxsir/image-tiny';

const IMAGE_PATTERN = /\.(jpg|jpeg|png|gif|webp|svg)/;

export const Up = () => {
  const ref = useRef<any>();
  const [files, setFiles] = useState<any[]>([]);
  const [quality, setQuality] = useState(80);
  const config = useConfig();
  const client = useClient();
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
      if (!client) return;
      const { prefix, cdn } = config.current!;
      const fileName = `___${charsIndex(
        dayjs().year() * 100 + dayjs().month(),
      )}${charsIndex(+new Date())}___${file.name}`;

      const remotePath = `${prefix}/${fileName}`.replace('//', '/');
      let zipFile = file;
      if (IMAGE_PATTERN.test(fileName)) {
        zipFile = await tiny(file, quality);
      }
      const up = await client?.multipartUpload(remotePath, zipFile, {
        progress(p, cpt, res) {
          // console.log({ p, cpt, res });
        },
        parallel: 4,
        // 200 kb
        partSize: 102400 * 200,
      });

      load(cdn + up.name);
      if (up.res.status !== 200) {
        error('上传失败');
      } else {
        // 动画完成要等一会
        setTimeout(() => {
          setFinished((x) => x + 1);
        }, 666);
      }
    },
    [client, config, quality],
  );

  useEffect(() => {
    if (count > 0 && finished === count) {
      Message.success('上传完成!');
    }
  }, [count, finished]);

  useEffect(() => {
    setFinished(0);
    setFiles([]);
  }, [config?.current?.alias]);

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
            <Typography.Text bold>图片压缩质量</Typography.Text>
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
            清空上传历史
          </Button>
        </Space>
      </Card>

      <Yap
        stylePanelAspectRatio={'4:3'}
        ref={ref}
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={true}
        server={{ process: uploading }}
        name="files"
        labelIdle={pic}
      />
    </div>
  );
};
