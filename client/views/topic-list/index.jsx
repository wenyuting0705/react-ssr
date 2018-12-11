import React, { Component } from 'react'
import {
  observer,
  inject,
} from 'mobx-react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import queryString from 'query-string'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab';
import List from '@material-ui/core/List'
import CircularProgress from '@material-ui/core/CircularProgress'
// import { Button } from '@material-ui/core'
// import { withStyles } from '@material-ui/core/styles';
// import AppState from '../../store/app-state'
import TopicStores from '../../store/topic-store'
import Container from '../components/container'
import TopicListItem from './list-item'
import { tabs } from '../../util/variable-define'

// const context = createContext()

@inject((stores) => {
  return {
    appState: stores.appState,
    topicStore: stores.topicStore,
  }
}) @observer

class TopicList extends Component {
  static contextTypes = {
    router: PropTypes.object,
  }

  // static contextType = context

  constructor() {
    super()
    this.state = {
    }
    this.changeTab = this.changeTab.bind(this)
    this.listItemClick = this.listItemClick.bind(this)
  }

  componentWillMount() {
    // do somethine here
    const tab = this.getTab()
    const { topicStore } = this.props
    topicStore.fetchTopics(tab)
  }

  componentWillReceiveProps(nextProps) {
    const { location, topicStore } = this.props
    if (nextProps.location.search !== location.search) {
      topicStore.fetchTopics(this.getTab(nextProps.location.search))
    }
  }

  getTab(search) {
    const { location } = this.props
    search = search || location.search
    const query = queryString.parse(search)
    const { tab } = query
    return tab || 'all'
  }

  changeTab = (e, value) => {
    const { router } = this.context
    router.history.push({
      pathname: '/index',
      search: `?tab=${value}`,
    })
  }

  listItemClick = (topic) => {
    const { router } = this.context
    console.log(topic)
    router.history.push(`/detail/${topic.id}`)
  }

  asyncBootstrap() {
    const query = queryString.parse(this.props.location.search)
    const { tab } = query
    return this.props.topicStore.fetchTopics(tab || 'all').then(() => {
      return true
    }).catch(() => {
      return false
    })
  }

  render() {
    const { topicStore } = this.props
    console.log('topicStore:', topicStore)
    const { createTopics, topics } = topicStore
    const syncingTopics = topicStore.syncing
    const { user } = this.props
    // const { tabIndex } = this.state
    const tab = this.getTab()
    return (
      <Container>
        <Helmet>
          <title>this is topic list</title>
          <meta name="description" content="this is description" />
        </Helmet>
        <Tabs value={tab} onChange={this.changeTab}>
          {
            Object.keys(tabs).map(tabItem => (
              <Tab label={tabs[tabItem]} value={tabItem} key={tabItem} />
            ))
          }
        </Tabs>
        {
          (createTopics && createTopics.length > 0)
            ? <List>
              {
                createTopics.map((topic) => {
                  topic = Object.assign({}, topic, {
                    author: user.info,
                  })
                  return (
                    <TopicListItem
                      onClick={() => this.listItemClick(topic)}
                      topic={topic}
                      key={topic.id}
                    />
                  )
                })
              }
            </List>
            : null
        }
        <List>
          {
            topics.map((topic) => {
              return (
                <TopicListItem
                  onClick={() => this.listItemClick(topic)}
                  topic={topic}
                  key={topic.id}
                />
              )
            })
          }
        </List>
        {
          syncingTopics
            ? (
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '40px 0' }}>
                <CircularProgress color="secondary" size={100} />
              </div>
            ) : null
        }
      </Container>
    )
  }
}

// 验证mobx的注入的时候都是使用wrappedComponent
TopicList.wrappedComponent.propTypes = {
  // appState: PropTypes.instanceOf(AppState).isRequired,
  topicStore: PropTypes.instanceOf(TopicStores).isRequired,
  user: PropTypes.object.isRequired,
}

TopicList.propTypes = {
  location: PropTypes.object.isRequired,
}

export default TopicList
