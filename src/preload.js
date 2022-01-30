import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('myAPI', {
    windowMinimize: () => ipcRenderer.send('window-minimize'),
    windowClose: () => ipcRenderer.send('window-close'),

    findVideos: async (files) => await ipcRenderer.invoke('findVideos', files),
    getVideoInfo: async (video) => await ipcRenderer.invoke('getVideoInfo', video),
    encode: async (video, speed) => await ipcRenderer.invoke('encode', video, speed),
    cancelEncode: async () => await ipcRenderer.invoke('cancelEncode'),
    getEncodeState: async () => await ipcRenderer.invoke('getEncodeState'),
    getThumbnail: async (video, position) => await ipcRenderer.invoke('getThumbnail', video, position),
  }
)
