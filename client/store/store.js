import AppState from './app-state'
import TopicStores from './topic-store'

export { AppState, TopicStores }

export default {
  AppState,
  TopicStores,
}

export const createStoreMap = () => ({
  appState: new AppState(),
  topicStore: new TopicStores(),
})
