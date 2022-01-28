module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      externals: ["ffmpeg-static-electron"],
      builderOptions: {
        files: [
          "**/*",
          "node_modules/**/*",
          "node_modules/ffmpeg-static-electron/bin/${os}/${arch}/ffmpeg",
          "node_modules/ffmpeg-static-electron/index.js",
          "node_modules/ffmpeg-static-electron/package.json",
        ],
        win: {
          target: [
            {
              target: 'zip', // 'zip', 'nsis', 'portable'
              arch: ['x64'], // 'x64', 'ia32'
            },
          ],
          files: [
            "node_modules/ffmpeg-static-electron/bin/win/${arch}/ffmpeg",
            "!node_modules/ffmpeg-static-electron/bin/win/ia32${/*}",
            "!node_modules/ffmpeg-static-electron/bin/linux${/*}",
            "!node_modules/ffmpeg-static-electron/bin/mac${/*}",
          ]
        },
      }
    }
  }
}
