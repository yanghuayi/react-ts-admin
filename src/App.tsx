/* global window */
/* global document */
import React from 'react'
import NProgress from 'nprogress'
import pathToRegexp from 'path-to-regexp'
import { Loader, MyLayout } from '@/components'
import { BackTop, Layout, Tabs } from 'antd'
import { Link } from 'react-router-dom'
import classnames from 'classnames';
import { Helmet } from 'react-helmet'

import Error from './pages/error/index'
import '../themes/index.less'
import './App.less'

const { Content, Footer, Sider } = Layout
const { Header, styles } = MyLayout
const { prefix, openPages, baseImgUrl } = config
const TabPane = Tabs.TabPane

let lastHref

const App = ({
  children, dispatch, app, loading, location,
}) => {
  const {
    user, siderFold, darkTheme, isNavbar, menuPopoverVisible, navOpenKeys, menu, permissions, logo, tabActiveKey, tabList
  } = app
  let { pathname, query } = location
  pathname = pathname.startsWith('/') ? pathname : `/${pathname}`
  const { iconFontJS, iconFontCSS, icon } = config
  const current = menu.filter(item => pathToRegexp(item.route || '').exec(pathname))
  const hasPermission = current.length ? true : false
  const { href } = window.location

  if (lastHref !== href) {
    NProgress.start()
    if (!loading.global) {
      NProgress.done()
      lastHref = href
    }
  }

  const headerProps = {
    menu,
    user,
    location,
    siderFold,
    isNavbar,
    menuPopoverVisible,
    navOpenKeys,
    switchMenuPopover() {
      dispatch({ type: 'app/switchMenuPopver' })
    },
    logout() {
      dispatch({ type: 'app/logout' })
    },
    switchSider() {
      dispatch({ type: 'app/switchSider' })
    },
    changeOpenKeys(openKeys) {
      dispatch({ type: 'app/handleNavOpenKeys', payload: { navOpenKeys: openKeys } })
    },
  }

  const siderProps = {
    menu,
    tabList,
    location,
    siderFold,
    darkTheme,
    navOpenKeys,
    logo,
    changeTheme() {
      dispatch({ type: 'app/switchTheme' })
    },
    changeOpenKeys(openKeys) {
      window.localStorage.setItem(`${prefix}navOpenKeys`, JSON.stringify(openKeys))
      // dispathc({ type: 'app/addTabPane', payload: { name: '', path:  } })
      dispatch({ type: 'app/handleNavOpenKeys', payload: { navOpenKeys: openKeys } })
    },
  }

  const tabProps = {
    hideAdd: true,
    onChange: (activeKey) => {
    },
    activeKey: tabActiveKey,
    type: tabList.length < 2 ? 'card' : 'editable-card',
    onEdit: (targetKey, action) => {
      if (action === 'remove') {
        dispatch({ type: 'app/removeTab', payload: targetKey})
      }
    }
  }

  if (openPages && openPages.includes(pathname)) {
    return (<div>
      <Loader fullScreen={true} spinning={loading.effects['app/query']} />
      {children}
    </div>)
  }
  return (
    <div>
      <Loader fullScreen={true} spinning={loading.effects['app/query']} />
      <Helmet>
        <title>激佩丝兴享融系统</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href={icon} type="image/x-icon" />
        {iconFontJS && <script src={iconFontJS} />}
        {iconFontCSS && <link rel="stylesheet" href={iconFontCSS} />}
      </Helmet>

      <Layout className={classnames({ [styles.dark]: darkTheme, [styles.light]: !darkTheme })}>
        {!isNavbar && <Sider
          trigger={null}
          collapsible={true}
          collapsed={siderFold}
        >
          {siderProps.menu.length === 0 ? null : <MyLayout.Sider {...siderProps} />}
        </Sider>}
        <Layout style={{ height: '100vh', paddingTop: '56px', overflow: 'auto', position: 'relative', }} id="mainContainer">
          <BackTop target={() => document.getElementById('mainContainer')} />
          <Header {...headerProps} />
          <Content>
            <Tabs  className="pageTab" {...tabProps}>
              { tabList.map(pane => <TabPane tab={<Link to={{pathname: pane.route, search: pane.search}}>{pane.name}</Link>} key={pane.id}></TabPane>)}
            </Tabs>
            {hasPermission ? children : <Error />}
          </Content>
        </Layout>
      </Layout>
    </div>
  )
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  app: PropTypes.object,
  loading: PropTypes.object,
}

export default App;
