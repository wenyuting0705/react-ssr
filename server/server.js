/*
webpack.server.js引用了libraryTarget库，采用了commonJS2的方式，默认采用export default的方式
node中默认使用require的方式，它不会读default的内容，而是拿到的整个export出来的东西，使用的时候要在require插件的后面加个.default
*/

const express = require('express')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const session = require('express-session')
const serverRender = require('./util/server-render')
const fs = require('fs') // 将生成的HTML文件读入
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

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

app.listen(3333, function () {
  console.log('server is listening on 3333')
})
/*
获取到浏览器发送的请求，并返回服务端的代码
然后将服务端渲染的内容插到HTML的body里返回，再把整个内容返回到浏览器端
*/
