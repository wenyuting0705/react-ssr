import {
  observable,
  toJS,
  action,
} from 'mobx'
import { post, get } from '../util/http'

let notifyId = 0

export default class AppState {
  @observable user = {
    isLogin: false,
    info: {},
    detail: {
      syncing: false,
      recentTopics: [],
      recentReplies: [],
    },
    collections: {
      syncing: false,
      list: [],
    },
  }

  @observable activeNotifications = []

  @observable notifications = []

  @observable state = {
    topicTab: 0,
  }

  init(user) {
    if (user) {
      this.user = user
    }
  }

  @action login(accessToken) {
    return new Promise((resolve, reject) => {
      post('/user/login', {}, {
        accessToken,
      }).then((resp) => {
        if (resp.status === 200 && resp.success) {
          this.user.info = resp.data
          this.user.isLogin = true
          resolve()
          this.notify({ message: '登录成功' })
        } else {
          reject(resp.msg)
        }
      }).catch((err) => {
        if (err.response) {
          reject(err.response.data.msg)
          this.notify({ message: err.response.data.msg })
        } else {
          reject(err.message)
          this.notify({ message: err.message })
        }
      })
    })
  }

  @action notify(config) {
    config.id = notifyId
    notifyId += 1
    this.activeNotifications.push(config)
  }

  @action closeNotify(notify) {
    this.activeNotifications.splice(this.activeNotifications.indexOf(notify), 1)
    this.notifications.push(notify)
  }

  @action getUserDetail() {
    this.user.detail.syncing = true
    return new Promise((resolve, reject) => {
      get(`/user/${this.user.info.loginname}`)
        .then((resp) => {
          if (resp.status === 200 && resp.success) {
            this.user.detail.recentReplies = resp.data.recent_replies
            this.user.detail.recentTopics = resp.data.recent_topics
            resolve()
          } else {
            reject(resp.msg)
            this.notify({ message: resp.data.msg })
          }
          this.user.detail.syncing = false
        }).catch((err) => {
          reject(err.message)
          this.notify({ message: err.msg })
          this.user.detail.syncing = false
        })
    })
  }

  @action getUserCollection() {
    this.user.collections.syncing = true
    return new Promise((resolve, reject) => {
      get(`/topic_collect/${this.user.info.loginName}`)
        .then((resp) => {
          if (resp.status === 200 && resp.success) {
            this.user.collections.list = resp.data
            resolve()
          } else {
            reject(resp.msg)
            this.notify({ message: resp.msg })
          }
          this.user.collections.syncing = false
        }).catch((err) => {
          reject(err.message)
          this.notify({ message: err.msg })
          this.user.collections.syncing = false
        })
    })
  }

  toJson() {
    return {
      user: toJS(this.user),
    }
  }
}
