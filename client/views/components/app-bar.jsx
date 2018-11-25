import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import {
  inject,
  observer,
} from 'mobx-react'

import AppBar from '@material-ui/core/AppBar'
import ToolBar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import HomeIcon from '@material-ui/icons/Home'

const styles = {
  root: {
    width: '100%',
  },
  flex: {
    flex: 1,
  },
}

@inject((stores) => {
  return {
    user: stores.appState.user,
  }
}) @observer

class MainAppBar extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.onHomeIconClick = this.onHomeIconClick.bind(this)
    this.createButtonClick = this.createButtonClick.bind(this)
    this.loginButtonClick = this.loginButtonClick.bind(this)
  }

  /* eslint-disable */
  onHomeIconClick = () => {
    const { router } = this.context
    router.history.push('/index?tab=all')
  }

  createButtonClick = () => {
    console.log('createButtonClick')
  }

  loginButtonClick = () => {
    const { router } = this.context
    const { location } = this.props
    console.log(location, location.pathname, '----')
    if (location.pathname !== '/user/login') {
      if (this.props.user.isLogin) {
        this.context.router.history.push('/user/info')
      } else {
        this.context.router.history.push({
          pathname: '/user/login',
          search: `?from=${location.pathname}`,
        })
      }
    }
  }

  render() {
    const { classes, user } = this.props
    return (
      <div className={classes.root}>
        <AppBar position="fixed">
          <ToolBar>
            <IconButton onClick={this.onHomeIconClick}>
              <HomeIcon />
            </IconButton>
            <Typography type="title" color="inherit" className={classes.flex}>TNode</Typography>
            {
              user.isLogin ?
              <Button raised="true" onClick={this.createButtonClick}>New</Button> :
                null
            }
            <Button onClick={this.loginButtonClick}>
            {
              user.isLogin ? user.info.loginname : '登录'
            }
            </Button>
          </ToolBar>
        </AppBar>
      </div>
    )
  }
}

MainAppBar.propTypes = {
  user: PropTypes.object.isRequired,
}

MainAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
}

export default withStyles(styles)(MainAppBar)
