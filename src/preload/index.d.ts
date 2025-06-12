import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface MainWindowApi {
    maximize: () => Promise<void>;
    unmaximize: () => Promise<void>;
    minimize: () => Promise<void>;
    close: () => Promise<void>;
  }

  interface DbApiOptions {
    destination?: 'app' | 'db';
  }

  interface DbApi {
    query: (sql: string, options?: DbApiOptions) => Promise<void>;
    queryToArray: <T>(sql: string, options?: DbApiOptions) => Promise<T[]>;
    queryToOneObject: <T>(sql: string, options?: DbApiOptions) => Promise<T>;
  }

  interface FileApi {
    delete: (path: string) => Promise<void>;
    getCurrentDirectoryFullPath: () => Promise<string>;
    copy: (from: string, to: string) => Promise<void>;
    mkdir: (path: string) => Promise<void>;
  }

  interface Window {
    electron: ElectronAPI;
    mainWindow: MainWindowApi;
    db: DbApi;
    file: FileApi;
  }
}
