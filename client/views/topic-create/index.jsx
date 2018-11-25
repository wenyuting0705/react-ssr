import React from 'react'
import PropTypes from 'prop-types'
import {
  inject,
  observer,
} from 'mobx-react'

import TextField from '@material-ui/core/TextField'
import Radio from '@material-ui/core/Radio'
import Button from '@material-ui/core/Button'
import IconReply from '@material-ui/icons/Reply'
import { withStyles } from '@material-ui/core/styles'

import Container from '../components/container'
import createStyles from './styles'
import { tabs } from '../../util/variable-define'

import SimpleMDE from '../../components/simple-mde'

@inject((stores) => {
  return {
    topicStore: stores.topicStore,
    appState: stores.appState,
  }
}) @observer
class TopicCreate extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  }

  constructor() {
    super()
    this.state = {
      // showEditor: false,
      title: '',
      content: '',
      tab: 'dev',
    }
    this.handleTitleChange = this.handleTitleChange.bind(this)
    this.handleContentChange = this.handleContentChange.bind(this)
    this.handleChangeTab = this.handleChangeTab.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
  }

  // componentDidMount() {
  //   setTimeout(() => {
  //     this.setState({
  //       showEditor: true,
  //     })
  //   }, 500)
  // }

  handleTitleChange(e) {
    this.setState({
      title: e.target.value,
    })
  }

  handleContentChange(value) {
    this.setState({
      content: value,
    })
  }

  handleChangeTab(e) {
    this.setState({
      tab: e.currentTarget.value,
    })
  }

  handleCreate() {
    // do create here
    const {
      tab, title, content,
    } = this.state
    const { appState, topicStore } = this.props
    const { router } = this.context
    if (!title) {
      return appState.notify({
        message: '标题必须填写',
      })
    }
    if (!content) {
      return appState.notify({
        message: '内容不能为空',
      })
    }
    return topicStore.createTopic(title, tab, content)
      .then(() => {
        router.history.push('/index')
      })
      .catch((err) => {
        appState.notify({
          message: err.message,
        })
      })
  }

  render() {
    const { classes } = this.props
    const { title, newReply, tab } = this.state
    return (
      <Container>
        <div className={classes.root}>
          <TextField
            className={classes.title}
            label="标题"
            value={title}
            onChange={this.handleTitleChange}
            fullWidth
          />
          <SimpleMDE
            onChange={this.handleContentChange}
            value={newReply}
            options={{
              toolbar: false,
              spellChecker: false,
              placeholder: '发表你的精彩意见',
            }}
          />
          <div>
            {
              Object.keys(tabs).map((t) => {
                if (t !== 'all' && t !== 'good') {
                  return (
                    <span className={classes.selectItem} key={t}>
                      <Radio
                        value={t}
                        checked={t === tab}
                        onChange={this.handleChangeTab}
                      />
                      {tabs[t]}
                    </span>
                  )
                }
                return null
              })
            }
          </div>
          <Button fab color="primary" onClick={this.handleCreate} className={classes.replyButton}>
            <IconReply />
          </Button>
        </div>
      </Container>
    )
  }
}

TopicCreate.wrappedComponent.propTypes = {
  topicStore: PropTypes.object.isRequired,
  appState: PropTypes.object.isRequired,
}

TopicCreate.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(createStyles)(TopicCreate)
