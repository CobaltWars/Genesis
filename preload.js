const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loadURL: (url) => ipcRenderer.send("load-url", url),
  goBack: () => ipcRenderer.send("go-back"),
  goForward: () => ipcRenderer.send("go-forward"),
  reload: () => ipcRenderer.send("reload"),
  closeWindow: () => ipcRenderer.send("close-window"),
  onUpdateURL: (callback) => ipcRenderer.on("update-url", callback),
  createTab: (url) => ipcRenderer.send("create-tab", url),
  switchTab: (tabId) => ipcRenderer.send("switch-tab", tabId)
});