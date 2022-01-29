import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('myAPI', {
    windowMinimize: () => ipcRenderer.send('window-minimize'),
    windowClose: () => ipcRenderer.send('window-close'),

    findVideos: async (files) => await ipcRenderer.invoke('findVideos', files),
    encode: async (video) => await ipcRenderer.invoke('encode', video),
    cancelEncode: async () => await ipcRenderer.invoke('cancelEncode'),
  }
)
