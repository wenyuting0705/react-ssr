// 处理跟话题有关的数据
import {
  observable,
  // toJS,
  // computed,
  action,
  extendObservable,
} from 'mobx'
import { topicSchema } from '../util/variable-define'
import { get } from '../util/http'

// 这样会返回所有字段已定义的topic对象
const createTopic = (topic) => {
  return Object.assign({}, topicSchema, topic)
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

  @observable syncing = false // 如果有进行异步操作请求东西，会变为true，可以在组件中反映出正在进行加载的一些操作
}

class TopicStores {
  @observable topics

  @observable syncing // 是否正在进行数据的请求

  constructor({ syncing, topics } = { syncing: false, topics: [] }) {
    this.syncing = syncing
    this.topics = topics.map(topic => new Topics(createTopic(topic)))
    // 这里有个问题是创建Topics时拿到的数据不一定是反应了所有react cnode返回的数据里的所有字段都有，
    // 但是如果不在一次性的时候使用 extendObservable 把这些东西变成observable属性的值附加到this上面，
    // 后续修改的时候又会出现问题，在util下创建了一个variable-define.js的文件，定义了一个对象topicSchema,
    // 这个对象里有一些值是cndoe返回的字段名，创建了默认值
  }

  addTopic(topic) {
    this.topics.push(new Topics(createTopic(topic)))
  }

  @action fetchTopics() {
    return new Promise((resolve, reject) => {
      this.syncing = true
      this.topics = []
      get('./topics', {
        mdrender: false,
        // 告诉我们CPU和CPI是否要把它的markdown字符串渲染成HTML字符串，cnode写文章用的是markdown格式，
        // markdown 要经过转义才能在网页上呈现，如果返回的是markdown，要转义成我们要呈现的内容，如果是HTML，可以直接进行展现
        // 默认返回false，使用markdown，因为需要编辑，如果没有markdown源码，没法编辑
      }).then((resp) => {
        if (resp.success) {
          resp.data.forEach((topic) => {
            this.addTopic(topic)
          })
          resolve()
        } else {
          reject()
        }
        this.syncing = false
      }).catch((err) => {
        reject(err)
        this.syncing = false
      })
    })
  }
}

export default TopicStores
