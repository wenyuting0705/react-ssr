import React from 'react'
import PropTypes from 'prop-types'
import {
  inject,
  observer,
} from 'mobx-react'

import Avatar from '@material-ui/core/Avatar'
import { withStyles } from '@material-ui/core/styles'

import UserIcon from '@material-ui/icons/AccountCircle'

import Container from '../components/container'
import userStyles from './styles/user-style'

@inject((stores) => {
  return {
    user: stores.appState.user,
  }
}) @observer
class User extends React.Component {
  componentDidMount() {
    // do someting here
  }

  render() {
    const { classes, user, children } = this.props
    const info = user.info || {}
    return (
      <Container>
        <div className={classes.avatar}>
          <div className={classes.bg} />
          {
            user.avatar_url
              ? <Avatar className={classes.avatarImg} src={info.avatar_url} />
              : <Avatar className={classes.avatarImg}><UserIcon /></Avatar>
          }
          <span className={classes.userName}>{info.loginname || '未登录'}</span>
        </div>
        {children}
      </Container>
    )
  }
}

User.wrappedComponent.propTypes = {
  user: PropTypes.object.isRequired,
}

User.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired,
}

export default withStyles(userStyles)(User)
