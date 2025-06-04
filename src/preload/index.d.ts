import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface MainWindowApi {
    maximize: () => Promise<void>;
    unmaximize: () => Promise<void>;
    minimize: () => Promise<void>;
    close: () => Promise<void>;
  }

  interface DbApi {
    query: (sql: string) => Promise<void>;
    queryToArray: <T> (sql: string) => Promise<T[]>;
    queryToOneObject: <T> (sql: string) => Promise<T>;
  }

  interface Window {
    electron: ElectronAPI;
    mainWindow: MainWindowApi;
    db: DbApi;
  }
}
