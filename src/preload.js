import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('myAPI', {
    windowMinimize: () => ipcRenderer.send('window-minimize'),
    windowClose: () => ipcRenderer.send('window-close'),

    openDevTools: async () => ipcRenderer.invoke('openDevTools'),

    findVideos: async (files) => await ipcRenderer.invoke('findVideos', files),
    getVideoInfo: async (video) => await ipcRenderer.invoke('getVideoInfo', video),
    encode: async (video, speed) => await ipcRenderer.invoke('encode', video, speed),
    clip: async (video, start, end) => await ipcRenderer.invoke('clip', video, start, end),
    cancel: async () => await ipcRenderer.invoke('cancel'),
    getState: async () => await ipcRenderer.invoke('getState'),
    getThumbnail: async (video, position) => ipcRenderer.invoke('getThumbnail', video, position),

    on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv)),
  }
)
