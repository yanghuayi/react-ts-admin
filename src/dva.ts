import createLoading from 'dva-loading'
import createHistory from 'history/createHashHistory'

export default {
  config() {
    return {
      onError(err) {
        err.preventDefault()
        console.error(err.message)
      },
    }
  },
  ...createLoading({
    effects: true,
  }),
  history: createHistory(),
}
