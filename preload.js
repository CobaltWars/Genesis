const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loadURL: (url) => ipcRenderer.send("load-url", url),
  goBack: () => ipcRenderer.send("go-back"),
  goForward: () => ipcRenderer.send("go-forward"),
  reload: () => ipcRenderer.send("reload"),
  onUpdateURL: (callback) => ipcRenderer.on("update-url", callback),
});


