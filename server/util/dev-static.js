/*
开发时的服务端渲染，
*/
const axios = require('axios')
const path = require('path')
const webpack = require('webpack')
const MemoryFs = require('memory-fs')
const proxy = require('http-proxy-middleware') // 解决跨域问题
const serverRender = require('./server-render')

const serverConfig = require('../../build/webpack.config.server')

// 开发template没有被写到硬盘上，但是要读取到template，封装方法获取template
const getTemplate = () => {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:8888/public/server.ejs')
      .then(res => {
        resolve(res.data) // res.data 是请求客户端返回的字符型的HTML内容
      })
      .catch(err => reject(err))
  })
}

// const Module = module.constructor

/*
NativeModule 相当于module.exports,里面有wrap方法对bundle进行了包装，
包装成了(function(exports,require,module,__filename,__dirname){...bundle})
*/
const NativeModule = require('module')
// vm 模块是 Node.js 内置的核心模块，它能让我们编译 JavaScript 代码和在指定的环境中运行
const vm = require('vm')

const getModuleFromString = (bundle, filename) => {
  const m = { exports: {} }
  const wrapper = NativeModule.wrap(bundle)
  // vm.Script 是一个类，用于创建代码实例，后面可以多次运行。
  const script = new vm.Script(wrapper, {
    filename: filename,
    displayErrors: true
  })
  /*
  script.runInContext(contextifiedSandbox) 就是使代码在 contextifiedSandbox 这个 context 中运行，
  从上面的输出可以看到，代码运行后，contextifiedSandbox 里面的属性的值已经被改变了，运行结果是最后一个表达式的值。
  */
  const result = script.runInThisContext()
  result.call(m.exports, m.exports, require, m)
  return m
}

// 文件保存在内存中
const mfs = new MemoryFs()

const serverCompiler = webpack(serverConfig)
serverCompiler.outputFileSystem = mfs
let serverBundle
// 编译文件
serverCompiler.watch({}, (err, stats) => {
  if (err) throw err
  stats = stats.toJson()
  // 打印错误信息
  stats.errors.forEach(err => {
    console.error(err)
  })
  // 打印警告信息
  stats.warnings.forEach(warn => console.warn(warn))

  const bundlePath = path.join(
    serverConfig.output.path,
    serverConfig.output.filename
  )
  const bundle = mfs.readFileSync(bundlePath, 'utf-8') // 同步读取文件
  // const m = new Module()
  // 这种写法无法使用require引入模块
  // m._compile(bundle, 'server-entry.js')
  const m = getModuleFromString(bundle, 'server-entry.js')
  serverBundle = m.exports
})

module.exports = function (app) {
  app.use('/public', proxy({
    target: 'http://localhost:8888'
  }))

  app.get('*', (req, res, next) => {
    if (!serverBundle) {
      return res.send('waiting for compile, refresh later!')
    }
    getTemplate()
      .then(template => {
        return serverRender(serverBundle, template, req, res)
      })
      .catch(next)
  })
}
