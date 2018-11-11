// 服务端入口文件
import React from 'react'
import { StaticRouter } from 'react-router-dom'
import { Provider, useStaticRendering } from 'mobx-react'
// react-jss 是在js中写CSS代码
import { JssProvider } from 'react-jss'
import { MuiThemeProvider } from '@material-ui/core/styles'
import App from './views/App'

import { createStoreMap } from './store/store'

// 让mobx在服务端渲染的时候不会重复数据变换
useStaticRendering(true)

/*
服务器端渲染是一种无状态的渲染。基本的思路是，将<BrowserRouter>替换为无状态的<StaticRouter>。
将服务器上接收到的URL传递给路由用来匹配，同时支持传入context特性。
当在浏览器上渲染一个<Redirect>时，浏览器历史记录会改变状态，同时将屏幕更新。
在静态的服务器环境中，无法直接更改应用程序的状态。在这种情况下，可以在context特性中标记要渲染的结果。
如果出现了context.url，就说明应用程序需要重定向。从服务器端发送一个恰当的重定向链接即可。
*/
/*
sheetRegistry, jss, theme
material-ui 做服务端渲染所需属性，从server-render传入
*/
export default (stores, routerContext, sheetRegistry, jss, theme, url) => (
  <Provider {...stores}>
    <StaticRouter context={routerContext} location={url}>
      <JssProvider registry={sheetRegistry} jss={jss}>
        <MuiThemeProvider theme={theme}>
          <App />
        </MuiThemeProvider>
      </JssProvider>
    </StaticRouter>
  </Provider>
)

export { createStoreMap }
