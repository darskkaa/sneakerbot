import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as url from 'url';

// Keep a global reference of the window object to avoid garbage collection
let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  // Create the browser window with appropriate settings according to the UI/UX guidelines
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 700,
    backgroundColor: '#141414', // Dark mode default as per UI guidelines
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false // Don't show until ready
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    // In development mode, load from React dev server
    await mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built React app
    await mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../client/build/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  // Show window when ready to avoid flickering
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Initialize auto-updater
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();

  // On macOS, recreate window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle IPC messages from renderer process
ipcMain.handle('start-task', async (event, taskConfig) => {
  // Task handling logic will go here
  console.log('Starting task with config:', taskConfig);
  return { success: true, taskId: Date.now() };
});

ipcMain.handle('stop-task', async (event, taskId) => {
  // Task stopping logic will go here
  console.log('Stopping task:', taskId);
  return { success: true };
});

// Auto-updater events
autoUpdater.on('update-available', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-available');
  }
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded');
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version has been downloaded. Restart the application to apply the updates.',
      buttons: ['Restart', 'Later']
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  }
});
