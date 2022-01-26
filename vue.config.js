module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        win: {
          target: [
            {
              target: 'portable', // 'zip', 'nsis', 'portable'
              arch: ['x64'], // 'x64', 'ia32'
            },
          ],
        },
      }
    }
  }
}
