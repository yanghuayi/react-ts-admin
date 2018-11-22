import { Icon, Layout, Menu, Popover } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import classnames from 'classnames';
import React from 'react';

import Bread from './Bread';
import styles from './Header.less';
import Menus from './Menu';

const { SubMenu } = Menu

interface IHeaderProps {
  user: any,
  logout: () => void,
  switchSider: () => void,
  siderFold: boolean,
  isNavbar: boolean,
  menuPopoverVisible: boolean,
  location: Location,
  switchMenuPopover: (visible: boolean) => void,
  navOpenKeys: string[],
  changeOpenKeys: (keys: string[]) => void,
  menu: Menus[],
  tabList: TabList[],
}

const Header = ({
  user, logout, switchSider, siderFold, isNavbar, menuPopoverVisible, location, switchMenuPopover, navOpenKeys, changeOpenKeys, menu, tabList
}: IHeaderProps) => {
  const handleClickMenu = (e: ClickParam) => e.key === 'logout' && logout()
  const menusProps = {
    menu,
    siderFold: false,
    darkTheme: false,
    isNavbar,
    handleClickNavMenu: switchMenuPopover,
    location,
    navOpenKeys,
    changeOpenKeys,
    tabList,
  }
  const breadProps = {
    menu,
    location,
  }
  return (
    <Layout.Header className={classnames({ [styles.header]: true, [styles.siderFold]: siderFold })}>
      {isNavbar
        ? <Popover placement="bottomLeft" onVisibleChange={switchMenuPopover} visible={menuPopoverVisible} overlayClassName={styles.popovermenu} trigger="click" content={<Menus {...menusProps} />}>
          <div className={styles.button}>
            <Icon type="bars" />
          </div>
        </Popover>
        : <div
          className={styles.button}
          onClick={switchSider}
        >
          <Icon type={classnames({ 'menu-unfold': siderFold, 'menu-fold': !siderFold })} />
        </div>}
      { isNavbar ? null : <Bread {...breadProps} />  }
      <div className={styles.rightWarpper}>
        <div className={styles.button}>
          <Icon type="mail" />
        </div>
        <Menu mode="horizontal" onClick={handleClickMenu}>
          <SubMenu
            style={{
              float: 'right',
            }}
            title={<span>
              <Icon type="user" />
              {user.username}
            </span>}
          >
            <Menu.Item key="logout">
              退出登录
            </Menu.Item>
          </SubMenu>
        </Menu>
      </div>
    </Layout.Header>
  )
}

export default Header
