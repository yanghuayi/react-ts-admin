import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown, Button, Icon, Menu } from 'antd'
import { ClickParam } from 'antd/lib/menu';

interface IOption {
  key: string,
  disabled: boolean,
  name: (record: object) => string | string,
}

interface IDropOption {
  onMenuClick: (e: ClickParam) => void,
  menuOptions: IOption[],
  buttonStyle: object,
  dropdownProps: object,
  record: object,
}

const DropOption = ({ onMenuClick, menuOptions = [], buttonStyle, dropdownProps, record }: IDropOption) => {
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

DropOption.propTypes = {
  onMenuClick: PropTypes.func,
  menuOptions: PropTypes.array.isRequired,
  buttonStyle: PropTypes.object,
  dropdownProps: PropTypes.object,
  record: PropTypes.object,
}

export default DropOption
