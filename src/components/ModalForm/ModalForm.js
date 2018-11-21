import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Cascader, Form, TreeSelect, Input, Select, Radio, DatePicker, Button, Icon, Modal, Checkbox } from 'antd'

const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option
const { MonthPicker, RangePicker } = DatePicker
const CheckboxGroup = Checkbox.Group
const FormItem = Form.Item
const { TextArea } = Input

class ModalForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  item(item) {
    const { form: { getFieldDecorator }, formData } = this.props
    if (item.display !== undefined) {
      if (!item.display) {
        return null
      }
    }
    const self = this
    let Dom = null

    let itemChange = (value) => {
      item.onchange ? item.onchange(value) : null
    }

    let inputChange = (e) => {
      item.onchange ? item.onchange(value) : null
    }

    switch (item.type) {
      case 'cascader':
        Dom = <Cascader disabled={item.disabled} changeOnSelect options={item.options} onChange={itemChange} placeholder={item.placeholder} />
        break;
      case 'treeSelect':
        Dom = <TreeSelect disabled={item.disabled} treeData={item.options} treeCheckable onChange={itemChange} placeholder={item.placeholder} />
        break;
      case 'input':
        Dom = <Input disabled={item.disabled} onChange={inputChange} addonAfter={item.unit} placeholder={item.placeholder} initialValue={item.value} />
        break;
      case 'password':
        Dom = <Input disabled={item.disabled} type="password" onChange={inputChange} addonAfter={item.unit} placeholder={item.placeholder} />
        break;
      case 'textarea':
        Dom = <TextArea row={item.row} disabled={item.disabled} placeholder={item.placeholder} />
        break;
      case 'select':
        Dom =
          <Select disabled={item.disabled} placeholder={item.placeholder} onChange={itemChange}>
            {/* <Option value="">全部</Option> */}
            {item.options.map((item) => { return (<Option key={item.key} value={item.key + ''}>{item.label}</Option>) })}
          </Select>
        break;
      case 'radio':
        Dom =
          <RadioGroup disabled={item.disabled} onChange={itemChange}>
            {item.options.map((item) => { return (<RadioButton key={item.key} value={item.key}>{item.label}</RadioButton>) })}
          </RadioGroup>
        break;
      case 'dateTime':
        Dom = <RangePicker disabled={item.disabled} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={[item.placeholder[0], item.placeholder[1]]} onChange={itemChange} />
        break;
      case 'selectTime':
        Dom = <DatePicker styles={{width:'300px'}} disabled={item.disabled} showTime={{ format: 'YYYY-MM-DD HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={item.placeholder} onChange={itemChange} />
        break;
    }
    let formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    return (
      <FormItem label={item.label} {...formItemLayout} key={item.key} data-key={item.key}>
        {getFieldDecorator(item.key, { ...item.params, initialValue: formData[item.key] })(Dom)}
      </FormItem>
    )
  }

  render() {
    const { formList, modalProps, onSubmit } = this.props
    modalProps.onOk = () => {
      this.props.form.validateFields((err, values) => {
        if (err !== null && err) {
          return false
        } else {
          onSubmit(values)
        }
      })
    }
    return (
      <Modal {...modalProps}>
        <Form onSubmit={this.handleSubmit}>
          {
            formList.map((item) => {
              return this.item(item)
            })
          }
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(ModalForm)