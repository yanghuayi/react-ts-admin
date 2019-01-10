/* global window */
/* global document */
/* global location */
import { routerRedux } from 'dva/router'
import {  } from 'dva/dynamic'
import queryString from 'query-string'
import { EffectsCommandMap, SubscriptionAPI } from 'dva';
import { AnyAction } from 'redux';

import config from '@/utils/config'
import { baseImgUrl } from '@/utils/index'

const { prefix } = config;

export default {
  namespace: 'app',
  state: {
    user: {},
    permissions: {
      visit: [],
    },
    menu: [
      {
        id: 1,
        icon: 'icon-dashboard',
        name: '首页',
        router: '/dashboard',
      },
    ],
    menuPopoverVisible: false,
    siderFold: window.localStorage.getItem(`${prefix}siderFold`) === 'true',
    // darkTheme: window.localStorage.getItem(`${prefix}darkTheme`) === 'true',
    darkTheme: true,
    isNavbar: document.body.clientWidth < 769,
    navOpenKeys: JSON.parse(window.localStorage.getItem(`${prefix}navOpenKeys`) || '') || [],
    locationPathname: '',
    locationQuery: {},
    logo: '',
    tabList: [], // tab列表
    tabActiveKey: '', // 激活tab-key值
  },
  subscriptions: {
    setupHistory({ dispatch, history }: SubscriptionAPI) {
      history.listen((location) => {
        dispatch({
          type: 'updateState',
          payload: {
            locationPathname: location.pathname,
            locationQuery: queryString.parse(location.search),
          },
        });
        dispatch({ type: 'addTabPane' })
      })
    },

    setup({ dispatch }: SubscriptionAPI) {
      dispatch({ type: 'query' });
      let tid: any;
      window.onresize = () => {
        clearTimeout(tid);
        tid = setTimeout(() => {
          dispatch({ type: 'changeNavbar' })
        }, 300)
      }
    },

  },
  effects: {
    * query({
      payload,
    }: { payload: any }, { call, put, select }: EffectsCommandMap) {
      const { result: { resultCode }, entity } = yield call(window.api.userInfo, payload); //getUserInfo请求
      const { locationPathname } = yield select((_: any) => _.app);
      if (!resultCode && entity) { //判断是否登录成功
        const { list } = yield call(window.api.menusQuery); //菜单
        const { permissions } = entity; // 权限列表
        let menu = list.filter((item: Menus) => {
          if (typeof item.role === 'string' && permissions.indexOf(item.role) > -1) {
            return true
          } else if (typeof item.role === 'object') {
            let roles = false;
            item.role.map((items: string) => {
              if (permissions.indexOf(items) > -1) {
                roles = true
              }
            });
            return roles
          } else if (typeof item.role === 'boolean') {
            return item.role
          } else {
            return false
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            user: entity,
            permissions,
            menu: menu,
          },
        });
        if (window.location.pathname === '/login') {
          yield put(routerRedux.push({
            pathname: '/dashboard',
          }))
        }
        yield put({ type: 'addTabPane' })
      } else if (config.openPages && config.openPages.indexOf(locationPathname) < 0) {
        yield put(routerRedux.push({
          pathname: '/login',
          search: queryString.stringify({
            from: locationPathname,
          }),
        }))
      }
    },

    * getLogo({ payload }: any, { call, put, select }: EffectsCommandMap) {
      const { entity } = yield call(window.api.getLogo);
      yield put({ type: 'saveLogo', payload: entity.logo })
    },

    * logout({
      payload,
    }: any, { call, put }: EffectsCommandMap) {
      function clearAllCookie() {
        let keys = document.cookie.match(/[^ =;]+(?=\=)/g);
        if (keys) {
          for (var i = keys.length; i--;) {
            document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
          }
        }
      }
      clearAllCookie();
      localStorage.clear();
      yield put({ type: 'login/reloadImg' });
      yield put({ type: 'clearTab' });
      yield call( window.api.logout, payload);
      yield put({ type: 'query' })
    },

    * changeNavbar(action: AnyAction, { put, select }: EffectsCommandMap) {
      const { app } = yield (select((_: any) => _));
      const isNavbar = document.body.clientWidth < 769;
      if (isNavbar !== app.isNavbar) {
        yield put({ type: 'handleNavbar', payload: isNavbar })
      }
    },

    * goBack(action: AnyAction, { put }: EffectsCommandMap) {
      yield put(routerRedux.go(-1))
    },

    * removeTab({
      payload,
    }: AnyAction, { put, select }: EffectsCommandMap) {
      let { tabList } = yield select((_: any) => _.app);
      let onIndex = 0;
      tabList = tabList.filter((item: TabList, index: number) => {
        if (item.id === payload) {
          onIndex = index > 0 ? index - 1 : 0;
          return false
        } else {
          return true
        }
      });
      yield put(routerRedux.push({
        pathname: tabList[onIndex].route,
        search: tabList[onIndex].search
      }));
      yield put({ type: 'removeTabPane', payload: tabList })
    },
  },
  reducers: {
    updateState(state: ModelApp, { payload }: AnyAction) {
      return {
        ...state,
        ...payload,
      }
    },

    logout(state: ModelApp, { payload }: AnyAction) {
      return {
        ...state,
        ...payload,
      }
    },

    saveLogo(state: ModelApp, { payload }: AnyAction) {
      return {
        ...state,
        logo: `${baseImgUrl}${payload}`
      }
    },

    switchSider(state: ModelApp) {
      window.localStorage.setItem(`${prefix}siderFold`, `${!state.siderFold}`);
      return {
        ...state,
        siderFold: !state.siderFold,
      }
    },

    switchTheme(state: ModelApp) {
      window.localStorage.setItem(`${prefix}darkTheme`, `${!state.darkTheme}`);
      return {
        ...state,
        darkTheme: !state.darkTheme,
      }
    },

    switchMenuPopver(state: ModelApp) {
      return {
        ...state,
        menuPopoverVisible: !state.menuPopoverVisible,
      }
    },

    handleNavbar(state: ModelApp, { payload }: AnyAction) {
      return {
        ...state,
        isNavbar: payload,
      }
    },

    handleNavOpenKeys(state: ModelApp, { payload: navOpenKeys }: AnyAction) {
      return {
        ...state,
        ...navOpenKeys,
      }
    },

    addTabPane(state: ModelApp) {
      let { locationPathname, menu, tabList, tabActiveKey } = state;
      let hash = window.location.hash;
      menu.map((item) => {
        if (item.route === locationPathname) {
          let flag = true;
          tabList.map((items, index) => {
            if (items.route === locationPathname) {
              flag = false;
              if (hash.indexOf('?') < 0) {
                tabList[index].search = ''
              }
            }
          });
          if (hash.indexOf('?') > -1) {
            item.search = hash.substring(hash.indexOf('?'), hash.length)
          }
          if (flag && !item.childern) {
            tabList.push(item)
          }
          tabActiveKey = item.id
        }
      });
      return {
        ...state,
        tabList,
        tabActiveKey,
      }
    },

    removeTabPane(state: ModelApp, { payload }: AnyAction) {
      return {
        ...state,
        tabList: payload,
      }
    },

    clearTab(state: ModelApp) {
      return {
        ...state,
        tabList: [],
      }
    },

    tabChange(state: ModelApp, { payload }: AnyAction) {
      return {
        ...state,
        tabActiveKey: payload
      }
    },
  },
}
