import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';

export const autoupdate = async () => {
  try {
    console.log('chceck');
    const { shouldUpdate, manifest } = await checkUpdate();
    if (shouldUpdate) {
      return {
        async install() {
          await installUpdate();
          // install complete, restart app
          await relaunch();
        },
      };
    } else {
      return {};
    }
  } catch (error) {
    console.log(error);
    return { error };
  }
};
