import React from 'react'
import { Menu } from 'antd'
import { Link } from 'react-router-dom'
import { arrayToTree, queryArray } from '@/utils'
import pathToRegexp from 'path-to-regexp'

interface IMenusProps {
  siderFold: boolean,
  darkTheme: boolean,
  navOpenKeys: string[],
  changeOpenKeys: (keys: string[]) => void,
  menu: Menus[],
  location: Location,
  tabList: TabList[],
}

const Menus = ({ siderFold, darkTheme, navOpenKeys, changeOpenKeys, menu, location, tabList }: IMenusProps) => {
  // 生成树状
  // mpid过滤
  const menuTree = arrayToTree(menu.filter(_ => _.mpid !== '-1'), 'id', 'mpid')
  const levelMap = {}
  const tabRoute: string[] = [];
  const tabSearch: string[] = [];
  tabList.map((item) => {
    tabRoute.push(item.route)
    tabSearch.push(item.search)
  })
  // 递归生成菜单
  const getMenus = (menuTreeN: any, siderFoldN: boolean) => {
    return menuTreeN.map((item: any) => {
      if (item.children) {
        if (item.mpid) {
          levelMap[item.id] = item.mpid
        }
        return (
          <Menu.SubMenu
            key={item.id}
            title={<span>
              {item.icon && <i className={`iconfont menu-icon ${item.icon}`}/>}
              {(!siderFoldN || !menuTree.includes(item)) && item.name}
            </span>}
          >
            {getMenus(item.children, siderFoldN)}
          </Menu.SubMenu>
        )
      }
      return (
        <Menu.Item key={item.id}>
          <Link to={{pathname: item.route || '#', search: tabRoute.indexOf(item.route) > -1 ? tabSearch[tabRoute.indexOf(item.route)] : ''}}>
            {item.icon && <i className={`iconfont menu-icon ${item.icon}`}/>}
            {(!siderFoldN || !menuTree.includes(item)) && item.name}
          </Link>
        </Menu.Item>
      )
    })
  }
  const menuItems = getMenus(menuTree, siderFold)

  // 保持选中
  const getAncestorKeys = (key: string) => {
    const map = {}
    const getParent = (index: string) => {
      const result = [String(levelMap[index])]
      if (levelMap[result[0]]) {
        result.unshift(getParent(result[0])[0])
      }
      return result
    }
    for (const index in levelMap) {
      if ({}.hasOwnProperty.call(levelMap, index)) {
        map[index] = getParent(index)
      }
    }
    return map[key] || []
  }

  const onOpenChange = (openKeys: string[]) => {
    const latestOpenKey = openKeys.find(key => !navOpenKeys.includes(key))
    const latestCloseKey = navOpenKeys.find(key => !openKeys.includes(key))
    let nextOpenKeys = []
    if (latestOpenKey) {
      nextOpenKeys = getAncestorKeys(latestOpenKey).concat(latestOpenKey)
    }
    if (latestCloseKey) {
      nextOpenKeys = getAncestorKeys(latestCloseKey)
    }
    changeOpenKeys(nextOpenKeys)
  }

  const menuProps = !siderFold ? {
    onOpenChange,
    openKeys: navOpenKeys,
  } : {}


  // 寻找选中路由
  let currentMenu
  let defaultSelectedKeys
  for (const item of menu) {
    if (item.route && pathToRegexp(item.route).exec(location.pathname)) {
      currentMenu = item
      break
    }
  }
  const getPathArray = (array: Menus[], current: Menus, pid: string, id: string) => {
    const result = [String(current[id])]
    const getPath = (item: Menus) => {
      if (item && item[pid]) {
        result.unshift(String(item[pid]))
        getPath(queryArray(array, item[pid], id))
      }
    }
    getPath(current)
    return result
  }
  if (currentMenu) {
    defaultSelectedKeys = getPathArray(menu, currentMenu, 'mpid', 'id')
  }

  if (!defaultSelectedKeys) {
    defaultSelectedKeys = ['1']
  }
  return (
    <Menu
      {...menuProps}
      mode={siderFold ? 'vertical' : 'inline'}
      theme={darkTheme ? 'dark' : 'light'}
      selectedKeys={defaultSelectedKeys}
    >
      {menuItems}
    </Menu>
  )
}

export default Menus
