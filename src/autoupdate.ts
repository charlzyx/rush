import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';

export const autoudpate = async () => {
  try {
    const { shouldUpdate, manifest } = await checkUpdate();
    if (shouldUpdate) {
      // display dialog
      await installUpdate();
      // install complete, restart app
      await relaunch();
    }
  } catch (error) {
    console.log(error);
  }
};
