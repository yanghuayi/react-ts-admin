/* global window */
/* global document */
import React, { ReactNode, Dispatch, ErrorInfo } from 'react'
import NProgress from 'nprogress'
import pathToRegexp from 'path-to-regexp'
import { connect } from 'dva'
import { BackTop, Layout, Tabs, LocaleProvider } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { withRouter } from 'dva/router'
import router from 'umi/router'
import { Loader, MyLayout, PageError } from '@/components'
import { Classnames, Config } from '@/utils/index'

import Error from '@/pages/404'
import '../themes/index.less'
import './index.less'

const { Content, Sider } = Layout;
const { Header, styles } = MyLayout;
const { prefix, openPages } = Config;
const TabPane = Tabs.TabPane;

let lastHref: string;

interface IAppProps {
  children: ReactNode,
  dispatch: Dispatch<any>,
  app: ModelApp,
  loading: {
    global: boolean,
    effects: any,
  },
  location: Location,
}
interface  IAppState {
  hasError: boolean
}
class App extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
    this.state = {
      hasError: false,
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: IAppProps) {
    let { pathname } = nextProps.location;
    if (pathname === '/') {
      router.push('/dashboard')
    }
    pathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
    /** 切换路由关闭异常错误页面 */
    if (pathname !== this.onpathname) {
      this.onpathname = pathname;
      this.errorHide()
    }
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.log(error, info);
  }

  errorHide = () => {
    this.setState({
      hasError: false,
    })
  };

  onpathname = '';

  render() {
    const {
      children, dispatch, app, loading, location,
    } = this.props;
    const {
      user, siderFold, darkTheme, isNavbar, menuPopoverVisible, navOpenKeys, menu, logo, tabActiveKey, tabList
    } = app;
    let { pathname } = location;
    pathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const { icon } = Config;
    const current = menu.filter(item => pathToRegexp(item.route || '').exec(pathname));
    const hasPermission = current.length ? true : false;
    const { href } = window.location;

    if (lastHref !== href) {
      NProgress.start();
      if (!loading.global) {
        NProgress.done();
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
      tabList,
      switchMenuPopover() {
        dispatch({ type: 'app/switchMenuPopver' })
      },
      logout() {
        dispatch({ type: 'app/logout' })
      },
      switchSider() {
        dispatch({ type: 'app/switchSider' })
      },
      changeOpenKeys(openKeys: string[]) {
        dispatch({ type: 'app/handleNavOpenKeys', payload: { navOpenKeys: openKeys } })
      },
    };

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
      changeOpenKeys(openKeys: string[]) {
        window.localStorage.setItem(`${prefix}navOpenKeys`, JSON.stringify(openKeys));
        // dispathc({ type: 'app/addTabPane', payload: { name: '', path:  } })
        dispatch({ type: 'app/handleNavOpenKeys', payload: { navOpenKeys: openKeys } })
      },
    };

    const tabProps = {
      hideAdd: true,
      activeKey: tabActiveKey,
      
      onEdit: (targetKey: string, action: string) => {
        if (action === 'remove') {
          dispatch({ type: 'app/removeTab', payload: targetKey})
        }
      }
    };

    if (openPages && openPages.includes(pathname)) {
      return (<div>
        <Loader fullScreen spinning={loading.effects['app/query']} />
        {children}
      </div>)
    }
    return (
      <LocaleProvider locale={zhCN}>
        <div>
          <Loader fullScreen spinning={loading.effects['app/query']} />
          <Helmet>
            <title>{Config.name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="icon" href={icon} type="image/x-icon" />
          </Helmet>

          <Layout className={Classnames({ [styles.dark]: darkTheme, [styles.light]: !darkTheme })}>
            {!isNavbar && <Sider
              trigger={null}
              collapsible
              collapsed={siderFold}
            >
              {siderProps.menu.length === 0 ? null : <MyLayout.Sider {...siderProps} />}
            </Sider>}
            <Layout style={{ height: '100vh', paddingTop: '56px', overflow: 'auto', position: 'relative', }} id="mainContainer">
              <BackTop target={() => {
                const Main: any = document.getElementById('mainContainer');
                return Main;
              }} />
              <Header {...headerProps} />
              <Content>
                <Tabs type={tabList.length < 2 ? 'card' : 'editable-card'} className="pageTab" {...tabProps}>
                  { tabList.map(pane => <TabPane tab={<Link to={{pathname: pane.route, search: pane.search}}>{pane.name}</Link>} key={pane.id}></TabPane>)}
                </Tabs>
                {this.state.hasError ? <PageError hide={this.errorHide} pathname={pathname} /> : hasPermission ? children : <Error />}
              </Content>
            </Layout>
          </Layout>
        </div>
      </LocaleProvider>
    )
  }
}

export default withRouter(connect(({ app, loading }: { app: ModelApp, loading: {
  global: boolean,
  effects: any,
}}) => ({ app, loading }))(App))
