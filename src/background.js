'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import * as path from "path";
import fs from "fs";
import * as ffmpeg from'ffmpeg-static-electron';
import * as ffprobe from'ffprobe-static-electron';
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
    resizable: false,
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

ipcMain.handle('getVideoInfo', async (event, video) => {
  const FFPROBE = ffprobe.path;
  const INPUT = video.path;

  const args = ["-i", INPUT, "-hide_banner", "-show_format",
                "-print_format", "json"];
  const ffprobeProcess = childProcess.spawnSync(FFPROBE, args);
  console.log('FFPROBE_STDOUT', ffprobeProcess.stdout.toString());
  console.log('FFPROBE_STDERR', ffprobeProcess.stderr.toString());
  console.log('FFPROBE_CODE', ffprobeProcess.status);
  if (ffprobeProcess.status === 0) {
    const result = JSON.parse(ffprobeProcess.stdout.toString());
    const duration = parseFloat(result.format.duration);
    return { duration, status: 0 }
  } else {
    return { status: ffprobeProcess.status }
  }
})

let ffmpegProcess = null;
let ffmpegStdOut = null;
let ffmpegStdErr = null;
let ffmpegCode = null;

const runffmpeg = (args) => {
  ffmpegProcess = childProcess.spawn(ffmpeg.path, args);
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
}

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

ipcMain.handle('cancel', async (event) => {
  cleanup();
})

ipcMain.handle('getState', async (event) => {
  let time = null;
  if (ffmpegStdErr !== null) {
    for (const text of ffmpegStdErr.split(' ')) {
      if (text.indexOf('time=') !== -1) {
        const timeStr = text.replace('time=', '');
        const [hour, minute, second] = timeStr.split(':');
        time = parseInt(hour) * 3600 + parseInt(minute) * 60 + parseFloat(second);
        break;
      }
    }
  }
  return {
    status: ffmpegCode,
    time: time,
    stdout: ffmpegStdOut,
    stderr: ffmpegStdErr,
  }
})

function makeAtempo(speed) {
  let atempos = [];
  for (let i = 0; i < Math.log2(speed); ++i) {
    atempos.push("atempo=2.0");
  }
  return atempos.join(",");
}

ipcMain.handle('encode', async (event, video, speed) => {
  cleanup();

  const INPUT = video.path;
  const OUTPUT = path.resolve(path.join(
    path.dirname(video.path),
    path.basename(video.path, path.extname(INPUT)) + `_${speed}xENC.mp4`
  ));

  const args = ["-i", INPUT, "-y"];
  if (speed !== 1) {
    args.push("-vf");
    args.push(`setpts=PTS/${speed.toFixed(1)}`);
    args.push("-af");
    const atempo = makeAtempo(speed);
    args.push(atempo);
  }
  args.push(OUTPUT);

  runffmpeg(args);
})

ipcMain.handle('getThumbnail', async (event, video, position) => {
  const FFMPEG = ffmpeg.path;
  const INPUT = video.path;

  const args = [
    "-ss", `${position}`,
    "-i", INPUT,
    "-vf", "scale=-1:100",  // height: 100px
    "-vframes", "1",
    "-f", "image2",
    "-"
  ];
  const thumbnailProcess = childProcess.spawnSync(FFMPEG, args);
  // console.log('THUMBNAIL_STDOUT', thumbnailProcess.stdout.toString().slice(0, 100));
  console.log('THUMBNAIL_STDERR', thumbnailProcess.stderr.toString());
  console.log('THUMBNAIL_CODE', thumbnailProcess.status);
  if (thumbnailProcess.status === 0) {
    const jpg = thumbnailProcess.stdout.toString('base64');
    return { jpg, status: 0 }
  } else {
    return { status: thumbnailProcess.status }
  }
})

ipcMain.handle('clip', async (event, video, start, end) => {
  cleanup();

  const INPUT = video.path;
  const OUTPUT = path.resolve(path.join(
    path.dirname(video.path),
    path.basename(video.path, path.extname(INPUT)) + `_${start}to${end}.mp4`
  ));

  const args = [
    "-ss", `${start}`,
    "-i", INPUT,
    "-y",
    "-t", `${end - start}`,
    "-c:v", "copy",
    "-c:a", "copy",
    OUTPUT
  ];

  runffmpeg(args);
})
