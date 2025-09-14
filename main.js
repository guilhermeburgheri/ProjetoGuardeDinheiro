const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  // Carregar frontend (dev ou build)
  if (process.env.ELECTRON_DEV) {
    win.loadURL('http://localhost:3000'); // React em modo dev
  } else {
    win.loadFile(path.join(__dirname, 'frontend/build/index.html'));
  }
}

app.on('ready', createWindow);
