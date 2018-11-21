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
import Container from '../layout/container'
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

  componentDidMount() {
    // do somethine here
    const tab = this.getTab()
    const { topicStore } = this.props
    topicStore.fetchTopics(tab)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      this.props.topicStore.fetchTopics(this.getTab(nextProps.location.search))
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

  listItemClick = () => {
    // do somethine here
  }

  render() {
    const { topicStore } = this.props
    const topicList = topicStore.topics
    const syncingTopics = topicStore.syncing
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
        <List>
          {
            topicList.map(topic => (
              <TopicListItem
                onClick={this.listItemClick}
                topic={topic}
                key={topic.id}
              />
            ))
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

export default TopicList

// 验证mobx的注入的时候都是使用wrappedComponent
TopicList.wrappedComponent.propTypes = {
  // appState: PropTypes.instanceOf(AppState).isRequired,
  topicStore: PropTypes.object.isRequired,
}

TopicList.propTypes = {
  location: PropTypes.object.isRequired,
}
