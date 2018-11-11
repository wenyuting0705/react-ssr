import React, { Component } from 'react'
// import {
//   observer,
//   inject,
// } from 'mobx-react'
// import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab';
// import { Button } from '@material-ui/core'
// import { withStyles } from '@material-ui/core/styles';
// import AppState from '../../store/app-state'
import Container from '../layout/container'
import TopicListItem from './list-item'

// @inject('appState') @observer

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
    // const { appState } = this.props
    const { tabIndex } = this.state
    const topic = {
      tab: 'share',
      title: 'this is title',
      username: 'wenyt',
      reply_count: '20',
      visit_count: '30',
      create_time: 'aaaaaaa',
    }
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
        <TopicListItem onClick={this.listItemClick} topic={topic} />
      </Container>
    )
  }
}

export default TopicList

// TopicList.propTypes = {
//   // appState: PropTypes.instanceOf(AppState).isRequired,
// }
