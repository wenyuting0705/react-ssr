/*
webpack.server.js引用了libraryTarget库，采用了commonJS2的方式，commonJS2默认采用export default的方式
node中默认使用require的方式，它不会读default的内容，而是拿到的整个export出来的东西，使用的时候要在require插件的后面加个.default
*/

const express = require('express')
/**
 * serve-favicon：
 * 请求网页logo，执行favicon.ico文件
*/
const favicon = require('serve-favicon')
/**
 * body-parser
 * 对post请求的请求体进行解析
 * 实现要点：
 * 1.处理不同类型的请求体：比如text、json、urlencoded等，对应的报文主体的格式不同。
 * 2.处理不同的编码：比如utf8、gbk等。
 * 3.处理不同的压缩类型：比如gzip、deflare等。
 * 4.其他边界、异常的处理。
 *  */
const bodyParser = require('body-parser')
/**
 * express-session:
 * 用指定的参数创建一个session中间件，sesison数据不是保存在cookie中，仅仅sessionID保存到cookie中，session的数据仅仅保存在服务器端
 *  */
const session = require('express-session')
const serverRender = require('./util/server-render')
const fs = require('fs') // 将生成的HTML文件读入
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

const app = express()

app.use(bodyParser.json()) // 解析 application/json
app.use(bodyParser.urlencoded({ extended: false })) // 解析 application/x-www-form-urlencoded

/**
 * name:在response中sessionID这个cookie的名称。也可以通过这个name读取，默认是connect.sid。
 *      如果一台机器上有多个app运行在同样的hostname+port, 那么你需要对这个sessin的cookie进行切割，所以最好的方法还是通过name设置不同的值
 * resave:强制session保存到session store中。
 * saveUninitialized:强制没有“初始化”的session保存到storage中，没有初始化的session指的是：刚被创建没有被修改,如果是要实现登陆的session那么最好设置为false,
 *                    设置为false还有一个好处，当客户端没有session的情况下并行发送多个请求时。默认是true,但是不建议使用默认值。
 * secret:用于对sessionID的cookie进行签名，可以是一个string(一个secret)或者数组(多个secret)。
 *        如果指定了一个数组那么只会用 第一个元素对sessionID的cookie进行签名，其他的用于验证请求中的签名。
 */
app.use(session({
  maxAge: 10 * 60 * 1000,
  name: 'tid',
  resave: false,
  saveUninitialized: false,
  secret: 'react cnode class'
}))

app.use(favicon(path.join(__dirname, '../bitbug_favicon.ico')))

app.use('/api/user', require('./util/handle-login'))
app.use('/api', require('./util/proxy'))

if (!isDev) {
  const serverEntry = require('../dist/server-entry') // 服务端入口代码
  const template = fs.readFileSync(path.join(__dirname, '../dist/server.ejs'), 'utf8') // 同步读取文件，指定读取的格式，否则读取的是buffer格式
  app.use('public', express.static(path.join(__dirname, '../dist'))) // 指定处理静态文件的目录

  // * 浏览器发送的任何请求都让它返回服务端渲染的代码
  app.get('*', function (req, res, next) {
    // 调用server-render里暴露出来的函数，传入打包好的服务端入口文件，读取出来的ejs文件（HTML模板）,返回最终渲染的HTML
    serverRender(serverEntry, template, req, res).catch(next)

    /*
    得到内容发送到浏览器
    const appString = ReactSSR.render(serverEntry)
    res.send(appString)
    */
  })
} else {
  const appStatic = require('./util/dev-static') //eslint-disable-line
  appStatic(app)
}

app.use(function (error, req, res, next) {
  console.log(error)
  res.status(500).send(error)
})

// 指定host和端口，不指定默认是0.0.0.0，从外网就可以访问到，是不安全的
const host = process.env_HOST || '0.0.0.0'
const port = process.env_PORT || 3333
app.listen(port, host, function () {
  console.log('server is listening on 3333')
})
/*
获取到浏览器发送的请求，并返回服务端的代码
然后将服务端渲染的内容插到HTML的body里返回，再把整个内容返回到浏览器端
*/
