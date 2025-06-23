
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Supprime la barre de titre native
    titleBarStyle: 'hidden', // Cache la barre de titre
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true
    }
  })

  win.loadFile('index.html')

  ipcMain.on('close-window', () => {
    app.quit()
  });
  ipcMain.on('maximize-window', () => {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  });
  ipcMain.on('minimize-window', () => {
    win.minimize()
  });

  // Envoyer l'état initial de maximisation
  win.on('maximize', () => {
    win.webContents.send('window-state-changed', 'maximized')
  })

  win.on('unmaximize', () => {
    win.webContents.send('window-state-changed', 'normal')
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


