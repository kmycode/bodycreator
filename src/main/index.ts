import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { Database } from 'sqlite3';
const db = new Database('./database.sqlite3');

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle(
    'createDb',
    (_ev) =>
      new Promise((resolve, reject) => {
        db.run(
          'CREATE TABLE IF NOT EXISTS my_memo ([id] integer primary key autoincrement, [memo] text, [date_time] datetime);',
          (err) => {
            if (err) reject(err);
            resolve(undefined);
          },
        );
      }),
  );

  ipcMain.handle(
    'database.query',
    (_ev, sql) =>
      new Promise((resolve, reject) => {
        db.run(sql, (ex) => {
          if (ex) {
            reject(ex);
            return;
          }
          resolve(undefined);
        });
      }),
  );

  ipcMain.handle(
    'database.queryToArray',
    (_ev, sql) =>
      new Promise((resolve, reject) => {
        db.all(sql, (ex, result) => {
          if (ex) {
            reject(ex);
            return;
          }
          resolve(result);
        });
      }),
  );

  ipcMain.handle(
    'database.queryToOneObject',
    (_ev, sql) =>
      new Promise((resolve, reject) => {
        db.get(sql, (ex, result) => {
          if (ex) {
            reject(ex);
            return;
          }
          resolve(result);
        });
      }),
  );

  /*
    ipcMain.handle('selectAll', (eve) =>
    new Promise((resolev, reject) => {
      db.serialize(() => {
        db.all('SELECT * FROM my_memo', (err, rows) => {
          if (err) reject(err);
          resolev(rows);
        });
      });
    })
  );
  */

  // Set app user model id for windows
  electronApp.setAppUserModelId('net.kmycode.bodycreator');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const mainWindow = createWindow();

  ipcMain.handle('window.maximize', () => mainWindow.maximize());
  ipcMain.handle('window.unmaximize', () => mainWindow.unmaximize());
  ipcMain.handle('window.minimize', () => mainWindow.minimize());
  ipcMain.handle('window.close', () => mainWindow.close());

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
