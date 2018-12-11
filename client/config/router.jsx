import React from 'react'
import {
  Route,
  Redirect,
  withRouter,
} from 'react-router-dom'
import { inject, observer } from 'mobx-react'
// import { observer, PropTypes } from 'mobx-react';
import PropTypes from 'prop-types'

import TopicList from '../views/topic-list'
import TopicDetail from '../views/topic-detail'
import UserLogin from '../views/user/login'
import TopicCreate from '../views/topic-create'
import UserInfo from '../views/user/info'
// import Test from '../views/test/test'

// 判断是否需要登录再渲染组件
const PrivateRoute = ({ isLogin, component: Component, ...rest }) => (
  <Route
    {...rest}
    render={
      (props) => (
        isLogin
          ? <Component {...props} />
          : <Redirect
            to={{
              pathname: '/user/login',
              search: `?from=${rest.path}`,
            }}
          />
      )
    }
  />
)
// 需要注意：使用mobx和react-router时，因为都是通过context传内容，会存在一个问题，mobx会修改组件，inject和observe组件时，
// 会修改componentMount 方法，如果直接用，会跟react-router产生冲突，当路由变化时这个组件不会重新进行渲染,使用withRouter
const InjectPrivateRoute = withRouter(inject((stores) => {
  return {
    isLogin: stores.appState.user.isLogin,
  }
})(observer(PrivateRoute)))

PrivateRoute.propTypes = {
  isLogin: PropTypes.bool,
  component: PropTypes.element.isRequired,
}
PrivateRoute.defaultProps = {
  isLogin: false,
}

// 配置路由时，如果不加exact，那么如果匹配/，匹配到的会是所有的路由，加了匹配的就是对应的一个路由
export default () => [
  <Route path="/" render={() => <Redirect to="/list" />} exact key="first" />,
  <Route path="/list" component={TopicList} key="list" />,
  <Route path="/detail/:id" component={TopicDetail} key="detail" />,
  <Route path="/user/login" exact component={UserLogin} key="login" />,
  // <Route path="/test" exact component={Test} key="test" />,
  <InjectPrivateRoute path="/user/info" component={UserInfo} key="info" />,
  <InjectPrivateRoute path="/topic/create" component={TopicCreate} key="create" />,
]
