import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface MainWindowApi {
    maximize: () => Promise<void>;
    unmaximize: () => Promise<void>;
    minimize: () => Promise<void>;
    close: () => Promise<void>;
  }

  interface DbApi {
    createDb: () => Promise<void>;
  }

  interface Window {
    electron: ElectronAPI;
    mainWindow: MainWindowApi;
    db: DbApi;
  }
}
