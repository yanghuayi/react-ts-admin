import React from 'react'
import { Dropdown, Button, Icon, Menu } from 'antd'
import { ClickParam } from 'antd/lib/menu';


interface IDropOption {
  onMenuClick: (e: ClickParam) => void,
  menuOptions: Operat[] | boolean,
  buttonStyle?: object,
  dropdownProps?: object,
  record: any,
}

const DropOption = ({ onMenuClick, menuOptions = [], buttonStyle, dropdownProps, record }: IDropOption) => {
  if (typeof menuOptions === 'object') {
    const menu = menuOptions.map(item => <Menu.Item key={item.key} disabled={item.disabled}>{typeof item.name === 'function' ? item.name(record) : item.name}</Menu.Item>)
  return (
    <Dropdown
      overlay={<Menu onClick={onMenuClick}>{menu}</Menu>}
      {...dropdownProps}
    >
      <Button style={{ border: 'none', ...buttonStyle }}>
        <Icon style={{ marginRight: 2 }} type="bars" />
        <Icon type="down" />
      </Button>
    </Dropdown>)
  }
  return null;
}

export default DropOption
