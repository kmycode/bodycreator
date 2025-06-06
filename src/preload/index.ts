import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

const mainWindow = {
  maximize: async () => ipcRenderer.invoke('window.maximize'),
  unmaximize: async () => ipcRenderer.invoke('window.unmaximize'),
  minimize: async () => ipcRenderer.invoke('window.minimize'),
  close: async () => ipcRenderer.invoke('window.close'),
};

// Custom APIs for renderer
const db = {
  query: async (sql) => ipcRenderer.invoke('database.query', sql),
  queryToArray: async (sql) => ipcRenderer.invoke('database.queryToArray', sql),
  queryToOneObject: async (sql) => ipcRenderer.invoke('database.queryToOneObject', sql),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('mainWindow', mainWindow);
    contextBridge.exposeInMainWorld('db', db);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
