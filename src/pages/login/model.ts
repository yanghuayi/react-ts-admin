import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { EffectsCommandMap } from 'dva';

import config from '@/utils/config';

export default {
  namespace: 'login',

  state: {
    authCodeImg: config.baseUrl + '/sys/user/getImg',
  },

  effects: {
    *login({ payload }: any, { put, call, select }: EffectsCommandMap) {
      const data = yield call(window.api.login, payload);
      const { locationQuery } = yield select((_: any) => _.app);
      if (!data.result.resultCode) {
        const { from } = locationQuery;
        yield put({ type: 'app/query' });
        if (from && from !== '/login') {
          yield put(routerRedux.push('/dashboard'));
        } else {
          yield put(routerRedux.push('/dashboard'));
        }
      } else {
        yield put({ type: 'reloadImg' });
        message.error(data.result.resultMessage);
      }
    },
  },

  reducers: {
    reloadImg(state: object) {
      return { ...state, authCodeImg: config.baseUrl + '/sys/user/getImg?t=' + Math.random() };
    },
  },
};
