/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  BrowserView,
  Event,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath, sleep } from './util';

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let hiddenBrowserViews: BrowserView[] = [];

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

// if (isDebug) {
//   require('electron-debug')();
// }

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      backgroundThrottling: false,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipcMain.handle('message', async (event, message) => {
  // do stuff
  // await awaitableProcess();
  if (message.browserwindow_dimension_update && mainWindow) {
    try {
      mainWindow.getBrowserViews().forEach((v, i) => {
        // if (i == 0) {
        v.setBounds(message.browserwindow_dimension_update.bound);
        // } else {
        //   v.setBounds({
        //     x: 300,
        //     y: 300,
        //     width: 200,
        //     height: 200
        //   });
        // }
      });
    } catch {
      console.log(
        'Cannot set bounds of browserview',
        message.browserwindow_dimension_update.bound,
      );
    }
  }

  if (message.capture_page && mainWindow) {
    const browserView = mainWindow.getBrowserViews().at(0);
    if (!browserView)
      return {
        error: true,
      };

    const img = await browserView.webContents.capturePage();
    return {
      data: img?.toDataURL(),
    };
  }

  if (message.add_browserview && mainWindow) {
    const topHidden = hiddenBrowserViews.at(0);
    if (topHidden) {
      mainWindow.addBrowserView(topHidden);
      return;
    }

    if (mainWindow.getBrowserViews().length > 0) {
      console.log('skipped create_browserview, only support one view for now');
      return;
    }

    console.log('create_browserview');
    const browserView = new BrowserView({
      webPreferences: {
        zoomFactor: 0.7,
        contextIsolation: true,
        preload: app.isPackaged
          ? path.join(__dirname, 'browserview_preload.js')
          : path.join(__dirname, '../../.erb/dll/browserview_preload.js'),
      },
    });

    browserView.webContents.on('dom-ready', () => {
      browserView.webContents.setZoomFactor(0.7);
      if (isDebug) {
        browserView.webContents.openDevTools();
      }
    });

    mainWindow.addBrowserView(browserView);
    browserView.setBounds(message.add_browserview.bound);
    browserView.webContents.loadURL('https://reddit.com');
  }

  if (message.gethiddenBrowserViews && mainWindow) {
    const browserviews = mainWindow.getBrowserViews();
    console.log('browserviews', browserviews);
    return {
      browserviews: browserviews.length,
    };
  }

  if (message.reset && mainWindow) {
    console.log('clearing storage...');
    await mainWindow.webContents.session.clearStorageData();

    const ps = mainWindow.getBrowserViews().map((v) => {
      return v.webContents.session.clearStorageData();
    });

    await Promise.all(ps);
    console.log('cleared storage');
  }

  if (message.hideBrowserViews && mainWindow) {
    const browserviews = mainWindow.getBrowserViews();
    hiddenBrowserViews = browserviews;
    console.log('remove', hiddenBrowserViews);
    browserviews.forEach((v) => mainWindow!.removeBrowserView(v));
  }
});
