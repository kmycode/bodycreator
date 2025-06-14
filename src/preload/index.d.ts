import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface MainWindowApi {
    maximize: () => Promise<void>;
    unmaximize: () => Promise<void>;
    minimize: () => Promise<void>;
    close: () => Promise<void>;
  }

  type ImageQueueItem = { buffer: ArrayBuffer; title: string; author: string; url: string; ext: string };

  interface AppApi {
    getImageQueue: () => Promise<ImageQueueItem[]>;
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
    saveFromBuffer: (path: string, buffer: ArrayBuffer) => Promise<void>;
  }

  interface Window {
    electron: ElectronAPI;
    mainWindow: MainWindowApi;
    app: AppApi;
    db: DbApi;
    file: FileApi;
  }
}
