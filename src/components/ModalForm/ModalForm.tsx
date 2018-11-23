import React, { Component } from 'react'
import { Cascader, Form, TreeSelect, Input, Select, Radio, DatePicker, Modal } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { ModalProps } from 'antd/lib/modal';

const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option
const { RangePicker } = DatePicker
const FormItem = Form.Item
const { TextArea } = Input

interface IModalProps {
  form: WrappedFormUtils,
  formData: object,
  formList: FilterList[],
  modalProps: ModalProps,
  onSubmit: (params: any) => void,
}

class ModalForm extends Component<IModalProps> {
  constructor(props: IModalProps) {
    super(props)
    this.state = {
    }
  }

  public item(item: any) {
    const { form: { getFieldDecorator }, formData } = this.props
    if (item.display !== undefined) {
      if (!item.display) {
        return null
      }
    }
    let Dom = null
    const itemChange = (value: any) => {
      item.onchange ? item.onchange(value) : null
    }

    const inputChange = (e: any) => {
      item.onchange ? item.onchange(e.target.value) : null
    }

    switch (item.type) {
      case 'cascader':
        Dom = <Cascader disabled={item.disabled} changeOnSelect={true} options={item.options} onChange={itemChange} placeholder={item.placeholder} />
        break;
      case 'treeSelect':
        Dom = <TreeSelect disabled={item.disabled} treeData={item.options} treeCheckable={true} onChange={itemChange} placeholder={item.placeholder} />
        break;
      case 'input':
        Dom = <Input disabled={item.disabled} onChange={inputChange} addonAfter={item.unit} placeholder={item.placeholder} value={item.value} />
        break;
      case 'password':
        Dom = <Input disabled={item.disabled} type="password" onChange={inputChange} addonAfter={item.unit} placeholder={item.placeholder} />
        break;
      case 'textarea':
        Dom = <TextArea rows={item.row} disabled={item.disabled} placeholder={item.placeholder} />
        break;
      case 'select':
        Dom =
          <Select disabled={item.disabled} placeholder={item.placeholder} onChange={itemChange}>
            {/* <Option value="">全部</Option> */}
            {item.options.map((item: any) => (<Option key={item.key} value={item.key + ''}>{item.label}</Option>))}
          </Select>
        break;
      case 'radio':
        Dom =
          <RadioGroup disabled={item.disabled} onChange={itemChange}>
            {item.options.map((item: any) => (<RadioButton key={item.key} value={item.key}>{item.label}</RadioButton>))}
          </RadioGroup>
        break;
      case 'dateTime':
        Dom = <RangePicker disabled={item.disabled} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={[item.placeholder[0], item.placeholder[1]]} onChange={itemChange} />
        break;
      case 'selectTime':
        Dom = <DatePicker style={{width:'300px'}} disabled={item.disabled} showTime={{ format: 'YYYY-MM-DD HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={item.placeholder} onChange={itemChange} />
        break;
    }
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    const Key: string = item.key;
    return (
      <FormItem label={item.label} {...formItemLayout} key={item.key} data-key={item.key}>
        {getFieldDecorator(Key, { ...item.params, initialValue: formData[item.key] })(Dom)}
      </FormItem>
    )
  }

  public render() {
    const { formList, modalProps, onSubmit } = this.props
    modalProps.onOk = () => {
      this.props.form.validateFields((err, values) => {
        if (err !== null && err) {
          return false
        } else {
          onSubmit(values);
          return true;
        }
      })
    }
    return (
      <Modal {...modalProps}>
        <Form>
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