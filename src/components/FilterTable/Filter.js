import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Cascader, Form, Row, Col, Input, Select, Radio, DatePicker, Button, Icon, Tooltip, Modal, Checkbox, Message } from 'antd'
import { config, GetQueryString, levelcodeToArray } from 'utils'
import queryString from 'query-string'
import styles from './filter.less'


const { APIV2 } = config
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option
const { RangePicker } = DatePicker
const CheckboxGroup = Checkbox.Group
const FormItem = Form.Item
const InputGroup = Input.Group;

class Filter extends Component {
  constructor(props) {
    super(props)
    const { filterForm, addBtn, exportBtn, tableList, otherList, localName } = this.props
    let tableAll = [...tableList, ...otherList]
    let checkboxList = []
    for (let i in tableAll) {
      checkboxList[i] = {
        value: tableAll[i].key,
        label: tableAll[i].title
      }
    }
    let checkboxDefault = []
    if (window.localStorage.getItem(localName)) {
      checkboxDefault = window.localStorage.getItem(localName).split(',');
    } else {
      for (let i in tableList) {
        checkboxDefault[i] = tableList[i].key
      }
    }
    this.state = {
      grade: false,
      setModal: false,
      filterForm: filterForm,
      emptyForm: JSON.parse(JSON.stringify(filterForm)),
      initForm: JSON.parse(JSON.stringify(filterForm)),
      addBtn: addBtn,
      exportBtn: exportBtn,
      tableAll: checkboxList,
      tableDefault: checkboxDefault,
      isMobile: document.body.clientWidth < 350,
      isPhone: document.body.clientWidth < 768,
      defaultTop: 0,
      setList: [],
      btnClick: false,
    }
  }

  componentWillMount() {
    let { filterForm, initForm } = this.state
    let hash = window.location.hash
    let params = queryString.parse(hash.substring(hash.indexOf('?'), hash.length));
    if (hash.indexOf('?') > -1) {
      this.setState({
        filterForm: params,
        initForm: params,
      }, () => {
        this.props.onSearch(this.state.initForm)
      })
    }
  }

  componentWillReceiveProps(nextProps) {
  }

  openSetModal() {
    this.setState({
      setModal: true
    })
  }

  setCancel = () => {
    this.setState({
      setModal: false
    })
  }

  saveTable = () => {
    let { filterForm, tableDefault, setList } = this.state
    const { tableList, outParams, fetch } = this.props;
    let keyList = setList.length ? setList : tableDefault; // 获取表头key 数组
    let tableNameList = [];
    keyList.map((item) => { // 通过key 匹配 name
      tableList.map((items) => {
        if (items.key === item) {
          tableNameList.push(items.title)
        }
      })
    })
    let params = {
      // 打包到任伟
      url: fetch.url,
      // 开发、测试
      // url: fetch.url.substring(7),
      headerkey: keyList.join(','),
      headername: tableNameList.join(','),
    }
    let urlParams = getUrlParams(Object.assign(filterForm, outParams, params)) // 转换为url格式参数
    function getUrlParams(params) {
      let urlParams = '';
      for (let i in params) {
        urlParams += `${i}=${params[i]}&`
      }
      return urlParams.substring(0, urlParams.length - 1)
    }
    window.location.href = `${APIV2}/sys/export/export?${urlParams}`;
  }

  settingTable = () => {
    let { tableDefault, setList } = this.state;
    this.setState({ loading: true })
    setTimeout(() => {
      this.setState({
        loading: false,
        setModal: false,
      })
      this.props.tableSetFun(setList.length > 0 ? setList : tableDefault)
    }, 1500);
  }

  filterItem(item, grade) {
    const { getFieldDecorator } = this.props.form
    let { initForm } = this.state;
    if (item.display !== undefined) {
      if (!item.display) {
        return null
      }
    }
    const self = this
    let Dom = null

    let itemChange = (value) => {
      let filterForm = self.state.filterForm
      if (item.type === 'seTime') {
        filterForm[item.value[0]] = value[0] ? value[0].format('YYYY-MM-DD') : ''
        filterForm[item.value[1]] = value[1] ? value[1].format('YYYY-MM-DD') : ''
      } else if (item.type === 'cascader') {
        filterForm[item.key] = JSON.parse(JSON.stringify(value)).pop()
      } else if (item.type === 'oneTime') {
        filterForm[item.key] = value ? value.format('YYYY-MM-DD') : ''
      } else if (item.type === 'select') {
        filterForm[item.key] = value ? value : ''
      }
      self.setState({
        filterForm,
      })
      item.onchange ? item.onchange(value) : null
    }

    let inputChange = (e) => {
      let value = e.target.value
      let filterForm = this.state.filterForm
      if (item.type === 'between') {
        filterForm[item.type === 'between' ? e.target.getAttribute('data-key') : item.key] = value
      } else if (item.type === 'lower') {
        filterForm[item.type === 'lower' ? e.target.getAttribute('data-key') : item.key] = value
      } else {
        filterForm[item.key] = value
      }
      self.setState({
        filterForm: filterForm
      })
    }

    switch (item.type) {
      case 'cascader':
        Dom = <Cascader changeOnSelect options={item.options} data-key={item.key} onChange={itemChange} placeholder={item.placeholder} />
        break;
      case 'between':
        Dom = <InputGroup compact>
          {
            getFieldDecorator(item.value[0], {
              initialValue: initForm[item.value[0]]
            })(
              <Input style={{ width: '40%', textAlign: 'left', marginTop: 3 }} data-key={item.value[0]} onChange={inputChange} placeholder={item.placeholder[0]} />
            )
          }
          <Input style={{ width: '20%', borderLeft: 0, marginTop: 3, pointerEvents: 'none', backgroundColor: '#fff' }} placeholder="~" disabled />
          {
            getFieldDecorator(item.value[1], {
              initialValue: initForm[item.value[1]]
            })(
              <Input style={{ width: '40%', textAlign: 'left', marginTop: 3, borderLeft: 0 }} data-key={item.value[1]} onChange={inputChange} placeholder={item.placeholder[1]} />
            )
          }
        </InputGroup>
        break;
      case 'lower':
        Dom = <InputGroup compact>
          <Input style={{ width: '60%', marginTop: 3, pointerEvents: 'none', backgroundColor: '#fff' }} placeholder={item.placeholder[0]} disabled />
          {
            getFieldDecorator(item.value[1], {
              initialValue: initForm[item.value[1]]
            })(
              <Input style={{ width: '40%', textAlign: 'left', marginTop: 3, borderLeft: 0 }} data-key={item.value[1]} onChange={inputChange} placeholder={item.placeholder[1]} />
            )
          }
        </InputGroup>
        break;
      case 'input':
        Dom = <Input onChange={inputChange} data-key={item.key} addonAfter={item.unit} placeholder={item.placeholder} />
        break;
      case 'select':
        Dom =
          <Select placeholder={item.placeholder} data-key={item.key} onChange={itemChange}>
            {item.options.map((item) => { return (<Option key={item.key} value={item.key + ''}>{item.label}</Option>) })}
          </Select>
        break;
      case 'radio':
        Dom =
          <RadioGroup data-key={item.key} onChange={itemChange}>
            {item.options.map((item) => { return (<RadioButton key={item.key} value={item.key}>{item.label}</RadioButton>) })}
          </RadioGroup>
        break;
      case 'dateTime':
        Dom = <DatePicker data-key={item.key} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD" placeholder={[item.placeholder[0], item.placeholder[1]]} onChange={itemChange} />
        break;
      case 'oneTime':
        Dom = <DatePicker data-key={item.key} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD" placeholder={item.placeholder} onChange={itemChange} />
        break;
      case 'seTime':
        Dom = <RangePicker width={'100%'} data-key={item.key} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD" placeholder={[item.placeholder[0], item.placeholder[1]]} onChange={itemChange} />
        break;
    }
    let formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    let defaultLayout = {
      span: 4,
      xl: 4,
      lg: 6,
      md: 6,
      sm: 8,
      xs: 12,
    }
    const rangeTimeLayout = {
      span: 8,
      xl: 8,
      lg: 12,
      md: 12,
      sm: 12,
      xs: 12,
    }
    const gradeLayout = {
      span: 8,
      xl: 8,
      lg: 8,
      md: 12,
      sm: 12,
      xs: 12,
    }
    return (
      grade ? <Col className={styles.gradeItem} {...gradeLayout} key={item.key}>
        <FormItem label={item.label} {...formItemLayout} className={styles.itemForm} key={item.key} data-key={item.key}>
          {item.type === 'between' ? Dom : getFieldDecorator(item.key, {
            initialValue: item.type === 'cascader' ? levelcodeToArray(initForm[item.key]) : initForm[item.key]
          })(
            Dom
          )}
        </FormItem>
      </Col> :
        <Col {...defaultLayout} key={item.key}>
          <FormItem className={styles.itemForm} key={item.key} data-key={item.key}>
            {item.type === 'between' ? Dom : getFieldDecorator(item.key, {
              initialValue: item.type === 'cascader' ? levelcodeToArray(initForm[item.key]) : initForm[item.key]
            })(
              Dom
            )}
          </FormItem>
        </Col>
    )
  }

  checkBoxChange = (val) => {
    if (val.length > 0) {
      this.setState({
        setList: val,
        btnClick: false
      });
    } else {
      this.setState({
        setList: val,
        btnClick: true
      })
      Message.error('请至少选择一项展示内容')
      return false;
    }
  }

  reset = () => {
    let { emptyForm } = this.state;
    this.setState({
      initForm: JSON.parse(JSON.stringify(emptyForm)),
      filterForm: JSON.parse(JSON.stringify(emptyForm)),
    }, () => {
      this.props.form.resetFields();
      this.props.onSearch(this.state.initForm);
      let href = window.location.href;
      if (href.indexOf('?') > -1) {
        href = href.substring(0, href.indexOf('?'))
      }
      window.location.href = href
    })
  }

  render() {
    const self = this
    const { filterForm, addBtn, tableAll, tableDefault, isMobile, loading, btnClick } = this.state
    const { filterList, filterGrade } = this.props
    let checkBoxParams = {
      options: tableAll,
      defaultValue: tableDefault,
      onChange: this.checkBoxChange,
    }
    let search = () => {
      let { filterForm, initForm } = this.state;
      let href = window.location.href;
      if (href.indexOf('?') > -1) {
        href = href.substring(0, href.indexOf('?'))
      }
      window.location.href = `${href}?${queryString.stringify(filterForm)}`
      self.props.onSearch(filterForm)
    }
    let gradeToggle = () => {
      if (self.state.grade) {
        self.setState({
          grade: false,
          defaultTop: 0,
        })
        document.querySelector('#dataTable').style.marginTop = 0;
      } else {
        self.setState({
          grade: true,
          defaultTop: -(document.querySelector('#gradeForm').clientHeight+200),
        })
        document.querySelector('#dataTable').style.marginTop = (document.querySelector('#gradeForm').clientHeight - document.querySelector('#defaultForm').clientHeight) + 'px';
      }
    }
    let addFun = () => {
      self.props.onAdd(self.state.addBtn)
    }
    const btnLayout = {
      xl: 24 - (filterList.length * 4),
      lg: 24,
      md: 24,
      sm: 24,
      xs: 24
    }
    return (
      <div className={styles.filterWrap}>
        <Form id="defaultForm" style={{ top: this.state.defaultTop }} className={styles.defaultForm} onSubmit={this.handleSubmit}>
          <Row gutter={20}>
            {
              filterList.map((item) => {
                return this.filterItem(item)
              })
            }
            <Col {...btnLayout}>
              <FormItem className={styles.rightItem} style={{ marginBottom: '0' }}>
                <div className={styles.filterBtn}>
                  <Button type="primary" icon="search" onClick={search}>搜索</Button>
                  <Button icon="reload" onClick={this.reset}>重置</Button>
                  {
                    filterGrade.length ?
                      <a style={{ marginLeft: 8, fontSize: 14 }} onClick={gradeToggle}>
                        {this.state.grade ? '普通搜索' : '高级搜索'} <Icon type={this.state.grade ? 'up' : 'down'} />
                      </a>
                      : null
                  }
                  <div className={styles.tableBtn}>
                    {this.state.addBtn ? <Button type="primary" onClick={addFun} icon="plus">新增</Button> : null}
                    {/* <Button onClick={addFun} icon="plus">新增</Button> */}
                    <div style={{ display: 'inline-block' }}>
                      {this.state.exportBtn ?
                        null : 
                        <Tooltip placement="bottom" title={'导出表格'}>
                          <Button shape="circle" onClick={() => this.saveTable()} icon="export" />
                        </Tooltip>
                      }
                      <Tooltip placement="bottom" title={'表格设置'}>
                        <Button shape="circle" onClick={() => { this.openSetModal() }} icon="setting" />
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Form id="gradeForm" className={[styles.gradeForm, this.state.grade ? styles.gradeShow : null]} onSubmit={this.handleSubmit}>
          <Row gutter={20}>
            {
              filterGrade.length ?
                <div className={[styles.filterGrade, this.state.grade ? styles.gradeShow : styles.gradeHide]}>
                  {
                    filterGrade.map((item) => {
                      return this.filterItem(item, true)
                    })
                  }
                </div> : null
            }
          </Row>
          <FormItem className={styles.gradeBtn}>
            <Button type="primary" icon="search" onClick={search}>搜索</Button>
            <Button icon="reload" onClick={this.reset}>重置</Button>
            <a style={{ marginLeft: 8, fontSize: 14 }} onClick={gradeToggle}>
              普通搜索 <Icon type="up" />
            </a>
          </FormItem>
        </Form>
        <Modal
          title="表格设置"
          maskClosable='false'
          visible={this.state.setModal}
          onCancel={this.setCancel}
          footer={[
            <Button key="back" onClick={this.setCancel}>取消</Button>,
            <Button key="submit" type="primary" disabled={btnClick} loading={loading} onClick={this.settingTable}>
              确认
            </Button>,
          ]}
        >
          <CheckboxGroup className={styles.checkboxList} {...checkBoxParams} />
        </Modal>
      </div>
    )
  }
}

Filter.propTypes = {
  filterList: PropTypes.array.isRequired,
  filterGrade: PropTypes.array,
  filterForm: PropTypes.object.isRequired,
  addBtn: PropTypes.bool,
  exportBtn: PropTypes.bool,
  onSearch: PropTypes.func.isRequired,
  tableList: PropTypes.array.isRequired,
  otherList: PropTypes.array.isRequired,
  onAdd: PropTypes.func,
  tableSetFun: PropTypes.func.isRequired,
  localName: PropTypes.string.isRequired,
  outParams: PropTypes.object,
  fetch: PropTypes.object,
}

export default Form.create()(Filter)