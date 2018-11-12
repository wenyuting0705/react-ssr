import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'mobx-react'
// react-hot-loader 实现页面的局部更新，需要依赖webpack中的HotModuleReplacement，
// webpack的HotModuleReplacement实现的是页面的刷新
import { AppContainer } from 'react-hot-loader' //eslint-disable-line
// 以下组件是用来创建主题和颜色的
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { lightBlue, pink } from '@material-ui/core/colors'

import App from './views/App'
import { AppState, TopicStore } from './store/store'

// 创建主题，指定主题颜色
const theme = createMuiTheme({
  palette: {
    primary: pink,
    accent: lightBlue,
    type: 'light',
  },
  typography: {
    useNextVariants: true,
  },
})

// 在template.ejs中加了个全局的状态，__INITIAL__STATE__，store的初始值
const initialState = window.__INITIAL__STATE__ || {} // eslint-disable-line

// 客户端渲染样式时，需要先将服务端渲染的style标签删掉
const createApp = (TheApp) => {
  class Main extends React.Component {
    // Remove the server-side injected CSS.
    componentDidMount() {
      const jssStyles = document.getElementById('jss-server-side');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }
    }

    render() {
      return <TheApp />
    }
  }
  return Main
}

const appState = new AppState(initialState.appState)
const topicStore = new TopicStore(initialState.topicStore)

const root = document.getElementById('root')

// react 16中要求如果做服务端渲染的话，使用hydrate进行渲染
const render = (Component) => {
  /*eslint-disable*/
  ReactDOM.hydrate(
    <AppContainer>
      <Provider appState={appState} topicStore={topicStore}>
        <BrowserRouter>
          <MuiThemeProvider theme={theme}>
            <Component />
          </MuiThemeProvider>
        </BrowserRouter>
      </Provider>
    </AppContainer>,
    root,
  )
}

render(createApp(App))

// 模块热替换的 API
if (module.hot) {
  module.hot.accept('./views/App.jsx', () => {
    // APP.jsx是使用的module.exports的方式，这里使用require的方式引入，需要加.default
    const NextApp = require('./views/App.jsx').default //eslint-disable-line
    render(createApp(NextApp))
  })
}
/*
react 16服务端渲染功能
支持streaming方式，在请求过来的时候服务端渲染先返回一部分不需要等待的内容，不如HTML头，固定信息之类的，剩下的要等待的内容比如读取数据，
渲染数据的代码，最后是结构等，以流的方式发送给客户端。
这种方式需要按照顺序的方式去渲染，否则无法使用
*/
// "lint": "eslint --ext .js --ext .jsx client/",
    // "precommit": "npm run lint",
