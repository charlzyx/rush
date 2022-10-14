import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';
import { app } from '@tauri-apps/api';
import { Message, Modal } from '@arco-design/web-react';
import { notify } from './utils/notify';
// if (ret.install) {
//   Modal.confirm({
//     title: '发现新版本!, 是否安装更新',
//     onConfirm() {
//       setLoaing(true);
//       ret.install!().finally(() => setLoaing(false));
//     },
//   });
// } else if (ret.error) {
//   notify.err(
//     'HTTP',
//     '无法连接更新服务',
//     `Reason:${(ret.error as any)?.message}`,
//   );
// } else {
//   Message.success('已经是最新版本!');
// }

export const autoupdate = async () => {
  try {
    console.log('chceck');
    const { shouldUpdate, manifest } = await checkUpdate();
    const now = await app.getVersion();
    if (shouldUpdate) {
      Modal.confirm({
        title: `发现新版本! ${now} ~> ${manifest?.version} 是否安装更新?`,
        content: `${manifest?.date}, ${manifest?.body}`,
        okText: '立即安装',
        cancelText: '先不管',
        async onConfirm() {
          await installUpdate();
          await relaunch();
        },
      });
    } else {
      Message.success('当前已经是最新版本!');
    }
  } catch (error) {
    console.log(error);
    notify.err(
      'HTTP',
      '更新出错啦',
      `Reason:${(error as any)?.message || error}`,
    );
    return { error };
  }
};
