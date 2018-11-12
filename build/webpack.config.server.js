const path = require('path')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const baseConfig = require('./webpack.base')
module.exports = webpackMerge(baseConfig, {
  target: 'node',
  mode: 'production',
  entry: {
    app: path.join(__dirname, '../client/server-entry.js')
  },
  // 防止将某些 import 的包(package)打包到 bundle 中，而是在运行时(runtime)再去从外部获取这些扩展依赖(external dependencies)。
  externals: Object.keys(require('../package.json').dependencies),
  output: {
    filename: 'server-entry.js',
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new webpack.DefinePlugin({
      // 定义变量，在打包之后的代码里可以获取这个变量
      'process.env.API_BASE': '"http://127.0.0.1:3000"'
    })
  ]
})
