/*
serialize-javascript：
将JavaScript序列化为 JSON 的超集，其中包括正则表达式，日期和函数。
从该包的单个导出函数返回的字符串是文字JavaScript，可以保存到.js文件中，或者通过创建<script>元素的内容嵌入到HTML文档中。
*/
const serialize = require('serialize-javascript')
const ejs = require('ejs')
/*
react-async-bootstrapper:
  在做服务端渲染的时候，有一些服务器请求到的数据是需要在首屏就可以看到的。
  那么这个请求的操作最好就是在服务端渲染的时候就拿到了，而不是来到客户端渲染的时候才进行请求
  把服务端渲染的组件包装起来，先执行异步方法，执行完毕后再进行余下的ssr渲染。
  我们在组件内部定义一个bootstrap()的异步方法，这个就代表我们先要执行的异步操作
*/
const asyncBootstrap = require('react-async-bootstrapper')
const ReactSSR = require('react-dom/server')
/*
react-helmet:
  这个可重用的React组件将管理对文档头的所有更改
特性：
  支持所有有效head标签：title，base，meta，link，script，noscript，和style标签。
  支持属性body，html和title标签。
  支持服务器端呈现。
  嵌套组件覆盖重复的头部更改。
  在同一组件中指定时，将保留重复的头部更改（支持“apple-touch-icon”等标记）。
  用于跟踪DOM更改的回调。
*/
const Helmet = require('react-helmet').default

const SheetsRegistry = require('react-jss').SheetsRegistry
const create = require('jss').create
const preset = require('jss-preset-default').default
const createMuiTheme = require('@material-ui/core/styles').createMuiTheme
const createGenerateClassName = require('@material-ui/core/styles/createGenerateClassName').default
const colors = require('@material-ui/core/colors')

const getStoreState = (stores) => {
  return Object.keys(stores).reduce((result, storeName) => {
    /*
      result: {},
      storeName: 'appState',
      stores[storeName]: AppState { count: [Getter/Setter], name: [Getter/Setter] },
      stores[storeName].toJson(): { count: 0, name: 'aaa' }
    */
    result[storeName] = stores[storeName].toJson()
    // result={ appState: { count: 0, name: 'aaa' } }
    return result
  }, {})
}

module.exports = (bundle, template, req, res) => {
  return new Promise((resolve, reject) => {
    const createStoreMap = bundle.createStoreMap // store.js暴露出来的函数，在server-entry中被引入
    const createApp = bundle.default // server-entry暴露出来的函数
    const routerContext = {}
    const stores = createStoreMap() // { appState: AppState { count: [Getter/Setter], name: [Getter/Setter] } }
    const sheetsRegistry = new SheetsRegistry()
    const jss = create(preset())
    jss.options.createGenerateClassName = createGenerateClassName
    const theme = createMuiTheme({
      palette: {
        primary: colors.lightBlue,
        accent: colors.pink,
        type: 'light'
      },
      typography: {
        useNextVariants: true
      }
    })
    const app = createApp(stores, routerContext, sheetsRegistry, jss, theme, req.url)

    asyncBootstrap(app).then(() => {
      if (routerContext.url) {
        res.status(302).setHeader('Location', routerContext.url)
        res.end()
        return
      }
      const helmet = Helmet.rewind()
      const state = getStoreState(stores) // { appState: { count: 0, name: 'aaa' } }
      const content = ReactSSR.renderToString(app)

      const html = ejs.render(template, {
        appString: content,
        initialState: serialize(state),
        meta: helmet.meta.toString(),
        title: helmet.title.toString(),
        style: helmet.style.toString(),
        link: helmet.link.toString(),
        materialCss: sheetsRegistry.toString() // 客户端渲染时要给服务端渲染的CSS去掉，客户端也同样会渲染
      })
      res.send(html)
      resolve()
    }).catch(reject)
  })
}
