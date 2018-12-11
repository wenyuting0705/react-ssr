// 处理跟话题有关的数据
import {
  observable,
  toJS,
  computed,
  action,
  extendObservable,
} from 'mobx'
import { topicSchema, replySchema } from '../util/variable-define'
import {
  get,
  post,
} from '../util/http'

// 这样会返回所有字段已定义的topic对象
const createTopic = (topic) => {
  return Object.assign({}, topicSchema, topic)
}

const createReply = (reply) => {
  return Object.assign({}, replySchema, reply)
}

/*
  为了扩展起来更容易，在这里重新创建一个类，每个话题都放到这个类里，变成这个类的实例
*/
class Topics {
  constructor(data) {
    // 为了让数据使用mobx的reactive的特性，如果直接给this赋值，而没有使用observable这种类型的，那么这个值就不是relative的，
    // 这个值在更新了之后，在组件里使用这个值的时候，更改之后组件是不会更新的，所以所有的附加到this上的属性都要使用observable
    // extendObservable这个方法可以把对象的所有属性都附加到this上
    extendObservable(this, data)
  }

  @observable createdReplies = []

  @observable syncing = false // 如果有进行异步操作请求东西，会变为true，可以在组件中反映出正在进行加载的一些操作

  @action doReply(content) {
    return new Promise((resolve, reject) => {
      post(`/topic/${this.id}/replies`, { needAccessToken: true }, {
        content,
      })
        .then((resp) => {
          if (resp.success) {
            this.createdReplies.push(createReply({
              create_at: Date.now(),
              id: resp.reply_id,
              content,
            }))
            resolve({
              replyId: resp.reply_id,
              content,
            })
          } else {
            reject(resp)
          }
        }).catch(reject)
    })
  }
}

class TopicStores {
  @observable topics

  @observable details

  @observable createdTopics

  @observable syncing = false // 是否正在进行数据的请求

  @observable tab = undefined

  constructor({
    syncing = false, topics = [], tab = null, details = [],
  } = {}) {
    this.syncing = syncing
    this.topics = topics.map(topic => new Topics(createTopic(topic)))
    this.details = details.map(detail => new Topics(createTopic(detail)))
    // 这里有个问题是创建Topics时拿到的数据不一定是反应了所有react cnode返回的数据里的所有字段都有，
    // 但是如果不在一次性的时候使用 extendObservable 把这些东西变成observable属性的值附加到this上面，
    // 后续修改的时候又会出现问题，在util下创建了一个variable-define.js的文件，定义了一个对象topicSchema,
    // 这个对象里有一些值是cndoe返回的字段名，创建了默认值
    this.tab = tab
  }

  addTopic(topic) {
    this.topics.push(new Topics(createTopic(topic)))
  }

  @computed get topicMap() {
    return this.topics.reduce((result, topic) => {
      result[topic.id] = topic
      return result
    }, {})
  }

  @computed get detailMap() {
    return this.details.reduce((result, topic) => {
      result[topic.id] = topic
      return result
    }, {})
  }

  // mdrender:
  // 告诉我们CPU和CPI是否要把它的markdown字符串渲染成HTML字符串，cnode写文章用的是markdown格式，
  // markdown 要经过转义才能在网页上呈现，如果返回的是markdown，要转义成我们要呈现的内容，如果是HTML，可以直接进行展现
  // 默认返回false，使用markdown，因为需要编辑，如果没有markdown源码，没法编辑

  @action fetchTopics(tab) {
    return new Promise((resolve, reject) => {
      // 判断是否已经请求过，请求过就不再请求了
      if (tab === this.tab && this.topics.length > 0) {
        resolve()
      } else {
        this.tab = tab
        this.topics = []
        this.syncing = true
        get('/topics', {
          mdrender: false,
          tab,
        }).then((resp) => {
          if (resp.success) {
            const topics = resp.data.map((topic) => {
              return new Topics(createTopic(topic))
            })
            this.topics = topics
            this.syncing = false
            resolve()
          } else {
            this.syncing = false
            reject()
          }
        }).catch((err) => {
          reject(err)
        })
      }
    })
  }

  @action createTopics(title, tab, content) {
    return new Promise((resolve, reject) => {
      post('/topics', {
        title, tab, content,
      })
        .then((resp) => {
          if (resp.success) {
            const topic = {
              title,
              tab,
              content,
              id: resp.topic_id,
              create_at: Date.now(),
            }
            this.createdTopics.push(new Topics(createTopic(topic)))
            console.log('createdTopics:', this.createdTopics)
            resolve(topic)
          } else {
            reject(new Error(resp.error_msg || '未知错误'))
          }
        })
        .catch((err) => {
          if (err.response) {
            reject(new Error(err.response.data.error_msg || '未知错误'))
          } else {
            reject(new Error('未知错误'))
          }
        })
    })
  }

  @action getTopicDetail(id) {
    return new Promise((resolve, reject) => {
      if (this.detailMap[id]) {
        resolve(this.detailMap[id])
      } else {
        get(`/topic/${id}`, {
          mdrender: false,
        })
          .then((resp) => {
            if (resp.success) {
              const topic = new Topics(createTopic(resp.data))
              this.details.push(topic)
              resolve(topic)
            } else {
              reject()
            }
          })
          .catch(reject)
      }
    })
  }

  toJson() {
    return {
      page: this.page,
      topics: toJS(this.topics),
      syncing: toJS(this.syncing),
      details: toJS(this.details),
      tab: this.tab,
    }
  }
}

export default TopicStores
