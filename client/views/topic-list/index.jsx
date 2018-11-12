import React, { Component } from 'react'
import {
  observer,
  inject,
} from 'mobx-react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab';
import List from '@material-ui/core/List'
import CircularProgress from '@material-ui/core/CircularProgress'
// import { Button } from '@material-ui/core'
// import { withStyles } from '@material-ui/core/styles';
import { AppState } from '../../store/app-state'
import Container from '../layout/container'
import TopicListItem from './list-item'

@inject(stores => {
  return {
    appState: stores.appState,
    topicStore: stores.topicStore,
  }
}) @observer

class TopicList extends Component {
  constructor() {
    super()
    this.state = {
      tabIndex: 0,
    }
    this.changeTab = this.changeTab.bind(this)
    this.listItemClick = this.listItemClick.bind(this)
  }

  componentDidMount() {
    // do somethine here
    this.props.topicStore.fetchTopics()
  }

  changeTab = (e, index) => {
    this.setState({
      tabIndex: index,
    })
  }

  listItemClick = () => {
    // do somethine here
  }

  render() {
    const { topicStore } = this.props
    const topicList = topicStore.topics
    const syncingTopics = topicStore.syncing
    const { tabIndex } = this.state
    // const topic = {
    //   tab: 'share',
    //   title: 'this is title',
    //   username: 'wenyt',
    //   reply_count: '20',
    //   visit_count: '30',
    //   create_time: 'aaaaaaa',
    // }
    return (
      <Container>
        <Helmet>
          <title>this is topic list</title>
          <meta name="description" content="this is description" />
        </Helmet>
        <Tabs value={tabIndex} onChange={this.changeTab}>
          <Tab label="全部" />
          <Tab label="分享" />
          <Tab label="工作" />
          <Tab label="问答" />
          <Tab label="精品" />
          <Tab label="测试" />
        </Tabs>
        <List>
          {
            topicList.map((topic, index) => <TopicListItem onClick={this.listItemClick} topic={topic} key={index} />)
          }
        </List>
        {
          syncingTopics
            ? (
              <div>
                <CircularProgress color="accent" size={100} />
              </div>
            ) : null
        }
      </Container>
    )
  }
}

export default TopicList

// 验证mobx的注入的时候都是使用wrappedComponent
TopicList.wrappedComponent.propTypes = {
  appState: PropTypes.instanceOf(AppState).isRequired,
  topicStore: PropTypes.object.isRequired,
}
