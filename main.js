const { app, BrowserWindow } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

let backend = null;

async function startBackend() {
  backend = require(path.join(app.getAppPath(), "backend", "server.js"));
  await backend.start(3001);
}

async function createWindow() {
  if (app.isPackaged) {
    await startBackend();
  }

  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (!app.isPackaged) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    return;
  }

  const indexPath = path.join(app.getAppPath(), "frontend", "build", "index.html");
  win.loadURL(pathToFileURL(indexPath).toString());
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (backend?.stop) backend.stop();
  if (process.platform !== "darwin") app.quit();
});
