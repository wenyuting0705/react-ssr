import React from 'react'
import {
  Route,
  Redirect,
} from 'react-router-dom'

import TopicList from '../views/topic-list'
import TopicDetail from '../views/topic-detail'
import UserLogin from '../views/user/login'

// 配置路由时，如果不加exact，那么如果匹配/，匹配到的会是所有的路由，加了匹配的就是对应的一个路由
export default () => [
  <Route path="/" render={() => <Redirect to="/list" />} exact key="first" />,
  <Route path="/list" component={TopicList} key="list" />,
  <Route path="/detail/:id" component={TopicDetail} key="detail" />,
  <Route path="/user/login" exact component={UserLogin} key="login" />,
]
