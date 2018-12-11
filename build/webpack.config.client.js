const path = require('path')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const baseConfig = require('./webpack.base')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const NameAllModulesPlugin = require('name-all-modules-plugin')
const cdnConfig = require('../app.config').cdn

const isDev = process.env.NODE_ENV === 'development'

const config = webpackMerge(baseConfig, {
  mode: 'development',
  entry: {
    app: path.join(__dirname, '../client/app.js')
  },
  output: {
    filename: '[name].[hash].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../client/template.html') // html内容不变，插入我们生成的js
    }),
    new HtmlWebpackPlugin({
      template: '!!ejs-compiled-loader!' + path.join(__dirname, '../client/server.template.ejs'),
      filename: 'server.ejs'
    })
  ]
})

if (isDev) {
  config.devtool = '#@cheap-module-eval-source-map' // 形成source-map在客户端打开网页调试代码（源代码）
  config.entry = {
    app: [
      /*
      react-hot-loader/patch： 页面的局部刷新，只刷新了修改了的代码，要放在entry的最前面，如果有babel-polyfill就放在babel-polyfill的后面
      babel-polyfill: Babel默认只转换新的JavaScript句法（syntax），而不转换新的API，
          比如Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise等全局对象，
          以及一些定义在全局对象上的方法（比如Object.assign）都不会转码。
          举例来说，ES6在Array对象上新增了Array.from方法。Babel就不会转码这个方法。如果想让这个方法运行，必须使用babel-polyfill，为当前环境提供一个垫片。
      */
      'react-hot-loader/patch',
      path.join(__dirname, '../client/app.js')
    ]
  }
  config.devServer = {
    host: '0.0.0.0',
    port: '8888',
    // contentBase: path.join(__dirname, '../dist'), // 不是output生成的内容的访问路径
    hot: true,
    overlay: {
      errors: true // 页面上显示错误信息，只显示错误信息
    },
    publicPath: '/public',
    historyApiFallback: { // 指定index文件，配置了对应关系，无法访问的路径都返回它配置的东西
      index: '/public/index.html'
    },
    proxy: { // 配置代理，请求cnode时，域名中有api的统一代理到localhost：3333
      '/api': 'http://localhost:3333'
    }
  }
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
} else {
  config.entry = {
    app: path.join(__dirname, '../client/app.js'),
    vendor: [
      'react',
      'react-dom',
      'react-router-dom',
      'mobx',
      'mobx-react',
      'axios',
      'query-string',
      'dateformat',
      'marked'
    ]
  }
  config.output.filename = '[name].[chunkhash].js' // 有多个文件对时候，会为每个文件生成自己对hash
  config.output.publicPath = cdnConfig.host
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }),
    // 打包的代码每次都会不一样，声明，不一样的打包到这里
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    new webpack.NamedModulesPlugin(), // 使用webpack异步的包编码时是使用的0，1，2，3，4去编码的，改了业务代码后顺序会出现变化，使用了之后会给重新命名，这样有模块变更不会影响其他模块
    // 解决webpack的一些问题
    new NameAllModulesPlugin(),
    new webpack.DefinePlugin({ // 区分打包的bundle还是开发的bundle
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.NamedChunksPlugin((chunk) => { // 给每个chunk打包的名字的操作
      if (chunk.name) {
        return chunk.name
      }
      return chunk.mapModules(m => path.relative(m.context, m.request)).join('_')
    })
  )
}

module.exports = config
