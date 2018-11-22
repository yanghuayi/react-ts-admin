import React from 'react'
import config from '@/utils/config'
import styles from './Layout.less'
import Menus from './Menu'

interface ISiderProps {
  siderFold: boolean,
  darkTheme: boolean,
  location: Location,
  changeTheme: () => void,
  navOpenKeys: string[],
  changeOpenKeys: (keys: string[]) => void,
  menu: Menus[],
  logo: any,
  tabList: TabList[],
}

const Sider = ({
  siderFold, darkTheme, location, changeTheme, navOpenKeys, changeOpenKeys, menu, logo, tabList
}: ISiderProps) => {
  const menusProps = {
    menu,
    siderFold,
    darkTheme,
    location,
    navOpenKeys,
    changeOpenKeys,
    tabList,
  }

  return (
    <div>
      <div className={styles.logo}>
        <img alt="logo" src={logo ? logo : config.logo} />
        {siderFold ? '' : <span>{config.name}</span>}
      </div>
      <Menus {...menusProps} />
    </div>
  )
}
export default Sider
