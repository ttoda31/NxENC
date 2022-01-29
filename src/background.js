'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import * as path from "path";
import fs from "fs";
import * as ffmpeg from'ffmpeg-static-electron';
import * as childProcess from 'child_process';
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 600,
    height: 630,
    // frame: false,
    // resizable: false,
    // center: true,
    titleBarStyle: "hidden", // add this line
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      worldSafeExecuteJavaScript: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.setMenu(null);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  cleanup();
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.on('window-minimize', function (event) {
  BrowserWindow.fromWebContents(event.sender).minimize();
})

ipcMain.on('window-close', function (event) {
  BrowserWindow.fromWebContents(event.sender).close();
})

const videoExtensions = ['.mp4', '.MP4', '.mov', '.MOV'];

function makePathObject(filePath) {
  return {
    path: filePath,
    name: path.basename(filePath),
  }
}

ipcMain.handle('findVideos', async (event, files) => {
  let videoFiles = [];
  for (const file of files) {
    const stat = fs.lstatSync(file);
    if (stat.isDirectory()) {
      const allDirents = fs.readdirSync(file, { withFileTypes: true });
      const fileNames = allDirents
        .filter(dirent => dirent.isFile())
        .filter(({ name }) => (videoExtensions.indexOf( path.extname(name) ) !==  -1))
        .map(({ name }) => makePathObject( path.resolve(`${file}/${name}`) ));
      videoFiles = videoFiles.concat(fileNames);
    } else if (stat.isFile()) {
      if (videoExtensions.indexOf( path.extname(file) ) !==  -1) {
        videoFiles.push( makePathObject(path.resolve(file)) );
      }
    }
  }
  return videoFiles;
})

let ffmpegProcess = null;
let ffmpegStdOut = null;
let ffmpegStdErr = null;
let ffmpegCode = null;
const cleanup = () => {
  if (ffmpegProcess !== null) {
    try {
      ffmpegProcess.kill();
      console.log("cleanup!");
    } catch (err) {
      console.log(err.name + ': ' + err.message);
    }
  }
  ffmpegProcess = null;
  ffmpegStdOut = null;
  ffmpegStdErr = null;
  ffmpegCode = null;
}

ipcMain.handle('encode', async (event, video) => {
  cleanup();

  const FFMPEG = ffmpeg.path;
  const INPUT = video.path;
  const OUTPUT = path.resolve(path.join(
    path.dirname(video.path),
    path.basename(video.path, path.extname(INPUT)) + "_enc_2x.mp4"
  ));

  const args = ["-i", INPUT, "-y", OUTPUT];
  ffmpegProcess = childProcess.spawn(FFMPEG, args);
  ffmpegProcess.stdout.on('data', (data) => {
    ffmpegStdOut = data.toString();
    console.log('STDOUT', ffmpegStdOut);
  });
  ffmpegProcess.stderr.on('data', (data) => {
    ffmpegStdErr = data.toString();
    console.log('STDERR', ffmpegStdErr);
  });
  ffmpegProcess.on('close', (code) => {
    ffmpegCode = code;
    console.log('CODE', ffmpegCode);
  });
})

ipcMain.handle('cancelEncode', async (event) => {
  cleanup();
})
