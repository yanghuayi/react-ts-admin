import { parse } from 'qs'
import modelExtend from 'dva-model-extend'
import { model } from '../model/common'
import { SubscriptionAPI, EffectsCommandMap } from 'dva';

export default modelExtend(model, {
  namespace: 'dashboard',
  state: {
    weather: {
      city: '深圳',
      temperature: '30',
      name: '晴',
      icon: '//s5.sencdn.com/web/icons/3d_50/2.png',
    },
    sales: [],
    quote: {
      avatar: 'http://img.hb.aicdn.com/bc442cf0cc6f7940dcc567e465048d1a8d634493198c4-sPx5BR_fw236',
    },
    numbers: [],
    recentSales: [],
    comments: [],
    completed: [],
    browser: [],
    cpu: {},
    user: {
      avatar: 'http://img.hb.aicdn.com/bc442cf0cc6f7940dcc567e465048d1a8d634493198c4-sPx5BR_fw236',
    },
  },
  subscriptions: {
    setup ({ dispatch, history }: SubscriptionAPI) {
      history.listen(({ pathname }) => {
        if (pathname === '/dashboard' || pathname === '/') {
          dispatch({ type: 'query' })
          dispatch({ type: 'queryWeather' })
        }
      })
    },
  },
  effects: {
    * query ({
      payload,
    }: any, { call, put }: EffectsCommandMap) {
      const data = yield call(window.api.dashboard, parse(payload))
      yield put({
        type: 'updateState',
        payload: data.data,
      })
    },
    * queryWeather ({
      payload = {},
    }: any, { call, put }: EffectsCommandMap) {
      payload.location = 'shenzhen'
      const result = yield call(window.api.weather, payload)
      const { success } = result
      if (success) {
        let data = result.data.results[0]
        const weather = {
          city: data.location.name,
          temperature: data.now.temperature,
          name: data.now.text,
          icon: `//s5.sencdn.com/web/icons/3d_50/${data.now.code}.png`,
        }
        yield put({
          type: 'updateState',
          payload: {
            weather,
          },
        })
      }
    },
  },
})
