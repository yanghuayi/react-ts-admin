import React, { Component } from 'react'
import { Cascader, Form, Row, Col, Input, Select, Radio, DatePicker, Button, Icon, Tooltip, Modal, Checkbox, message } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { ColumnProps } from 'antd/lib/table';
import { levelcodeToArray } from '@/utils'
import queryString from 'query-string'
import styles from './filter.less'



const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option
const { RangePicker } = DatePicker
const CheckboxGroup = Checkbox.Group
const FormItem = Form.Item
const InputGroup = Input.Group

interface IFilterProps<T> {
  filterList: FilterList[],
  filterGrade: FilterList[],
  filterForm: object,
  tableList: Array<ColumnProps<T>>,
  otherList: any,
  addBtn: boolean,
  exportBtn: boolean,
  localName: string,
  outParams: object,
  fetch: FetchData,
  onSearch: (params: object) => void,
  tableSetFun: (list: string[]) => void,
  form: WrappedFormUtils,
  onAdd: () => void,
}

interface IFiterState {
  grade: boolean,
  setModal: boolean,
  filterForm: object,
  emptyForm: object,
  initForm: object,
  addBtn: boolean,
  exportBtn: boolean,
  tableAll: Array<{ value: string, label: string }>,
  tableDefault: string[],
  isMobile: boolean,
  isPhone: boolean,
  defaultTop: number,
  setList: string[],
  btnClick: boolean,
  loading: boolean,
}

class Filter<T> extends Component<IFilterProps<T>, IFiterState> {
  constructor(props: IFilterProps<T>) {
    super(props)
    const { filterForm, addBtn, exportBtn, tableList, otherList, localName } = this.props
    const tableAll = [...tableList, ...otherList]
    const checkboxList: Array<{ value: string, label: string }> = []
    for (const i in tableAll) {
      checkboxList[i] = {
        value: tableAll[i].key,
        label: tableAll[i].title
      }
    }
    let checkboxDefault: string[] = []
    const LocalName =  window.localStorage.getItem(localName);
    if (LocalName) {
      checkboxDefault = LocalName.split(',');
    } else {
      for (const i in tableList) {
        const Key = tableList[i].key;
        checkboxDefault[i] = Key ? Key + '' : '';
      }
    }
    this.state = {
      grade: false,
      setModal: false,
      filterForm,
      emptyForm: JSON.parse(JSON.stringify(filterForm)),
      initForm: JSON.parse(JSON.stringify(filterForm)),
      addBtn,
      exportBtn,
      tableAll: checkboxList,
      tableDefault: checkboxDefault,
      isMobile: document.body.clientWidth < 350,
      isPhone: document.body.clientWidth < 768,
      defaultTop: 0,
      setList: [],
      btnClick: false,
      loading: false,
    }
  }

  public componentWillMount() {
    const hash = window.location.hash
    const params = queryString.parse(hash.substring(hash.indexOf('?'), hash.length));
    if (hash.indexOf('?') > -1) {
      this.setState({
        filterForm: params,
        initForm: params,
      }, () => {
        this.props.onSearch(this.state.initForm)
      })
    }
  }

  public openSetModal() {
    this.setState({
      setModal: true
    })
  }

  public setCancel = () => {
    this.setState({
      setModal: false
    })
  }

  public saveTable = () => {
    const { filterForm, tableDefault, setList } = this.state
    const { tableList, outParams, fetch } = this.props;
    const keyList = setList.length ? setList : tableDefault; // 获取表头key 数组
    const tableNameList: string[] = [];
    keyList.map((item) => { // 通过key 匹配 name
      tableList.map((items) => {
        if (items.key === item) {
          const title: any = items.title ? items.title : '';
          tableNameList.push(title);
        }
      })
    })
    const params = {
      // 打包到任伟
      url: fetch.url,
      // 开发、测试
      // url: fetch.url.substring(7),
      headerkey: keyList.join(','),
      headername: tableNameList.join(','),
    }
    const urlParams = getUrlParams(Object.assign(filterForm, outParams, params)) // 转换为url格式参数
    function getUrlParams(params: object) {
      let urlParams = '';
      for (const i in params) {
        urlParams += `${i}=${params[i]}&`
      }
      return urlParams.substring(0, urlParams.length - 1)
    }
    // window.location.href = `${APIV2}/sys/export/export?${urlParams}`;
  }

  public settingTable = () => {
    const { tableDefault, setList } = this.state;
    this.setState({ loading: true })
    setTimeout(() => {
      this.setState({
        loading: false,
        setModal: false,
      })
      this.props.tableSetFun(setList.length > 0 ? setList : tableDefault)
    }, 1500);
  }

  public filterItem(item: FilterList, grade?: boolean) {
    const { getFieldDecorator } = this.props.form
    const { initForm } = this.state;
    if (item.display !== undefined) {
      if (!item.display) {
        return null
      }
    }
    const self = this
    let Dom = null

    const itemChange = (value: any) => {
      const filterForm = self.state.filterForm
      if (item.type === 'seTime' && item.value) {
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
      if (item.onchange) {
        item.onchange(value)
      }
    }

    const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const filterForm = this.state.filterForm
      if (item.type === 'between') {
        const Key = item.type === 'between' ? e.target.getAttribute('data-key') : item.key;
        if (Key) {
          filterForm[Key] = value
        }
      } else if (item.type === 'lower') {
        const Key = item.type === 'lower' ? e.target.getAttribute('data-key') : item.key;
        if (Key) {
          filterForm[Key] = value
        }
      } else {
        filterForm[item.key] = value
      }
      self.setState({
        filterForm
      })
    }

    switch (item.type) {
      case 'cascader':
        const PlaceHolder = typeof item.placeholder === 'string' ? item.placeholder : '';
        Dom = <Cascader changeOnSelect={true} options={item.options} data-key={item.key} onChange={itemChange} placeholder={PlaceHolder} />
        break;
      case 'between':
        const Value = item.value ? item.value : ['', ''];
        const PlaceHolderArr = typeof item.placeholder === 'object' ? item.placeholder : ['', ''];
        Dom = <InputGroup compact={true}>
          {
            getFieldDecorator(Value[0], {
              initialValue: initForm[Value[0]]
            })(
              <Input style={{ width: '40%', textAlign: 'left', marginTop: 3 }} data-key={Value[0]} onChange={inputChange} placeholder={PlaceHolderArr[0]} />
            )
          }
          <Input style={{ width: '20%', borderLeft: 0, marginTop: 3, pointerEvents: 'none', backgroundColor: '#fff' }} placeholder="~" disabled={true} />
          {
            getFieldDecorator(Value[1], {
              initialValue: initForm[Value[1]]
            })(
              <Input style={{ width: '40%', textAlign: 'left', marginTop: 3, borderLeft: 0 }} data-key={Value[1]} onChange={inputChange} placeholder={PlaceHolderArr[1]} />
            )
          }
        </InputGroup>
        break;
      case 'lower':
        const ValueArr = item.value ? item.value : ['', ''];
        const PlaceHolderArr2 = typeof item.placeholder === 'object' ? item.placeholder : ['', ''];
        Dom = <InputGroup compact={true}>
          <Input style={{ width: '60%', marginTop: 3, pointerEvents: 'none', backgroundColor: '#fff' }} placeholder={PlaceHolderArr2[0]} disabled={true} />
          {
            getFieldDecorator(ValueArr[1], {
              initialValue: initForm[ValueArr[1]]
            })(
              <Input style={{ width: '40%', textAlign: 'left', marginTop: 3, borderLeft: 0 }} data-key={ValueArr[1]} onChange={inputChange} placeholder={PlaceHolderArr2[1]} />
            )
          }
        </InputGroup>
        break;
      case 'input':
        const PlaceHolder3 = typeof item.placeholder === 'string' ? item.placeholder : '';
        Dom = <Input onChange={inputChange} data-key={item.key} addonAfter={item.unit} placeholder={PlaceHolder3} />
        break;
      case 'select':
        Dom =
          <Select placeholder={item.placeholder} data-key={item.key} onChange={itemChange}>
            {item.options.map((item: any) => (<Option key={item.key} value={item.key + ''}>{item.label}</Option>))}
          </Select>
        break;
      case 'radio':
        Dom =
          <RadioGroup data-key={item.key} onChange={itemChange}>
            {item.options.map((item: any) => (<RadioButton key={item.key} value={item.key}>{item.label}</RadioButton>))}
          </RadioGroup>
        break;
      case 'dateTime':
        const PlaceHolderArr3 = typeof item.placeholder === 'string' ? item.placeholder : '';
        Dom = <DatePicker data-key={item.key} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD" placeholder={PlaceHolderArr3} onChange={itemChange} />
        break;
      case 'oneTime':
        const PlaceHolder2 = typeof item.placeholder === 'string' ? item.placeholder : '';
        Dom = <DatePicker data-key={item.key} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD" placeholder={PlaceHolder2} onChange={itemChange} />
        break;
      case 'seTime':
      const PlaceHolderArr4 = typeof item.placeholder === 'object' ? item.placeholder : ['', ''];
        Dom = <RangePicker style={{ width: '100%' }} data-key={item.key} showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD" placeholder={[PlaceHolderArr4[0], PlaceHolderArr4[1]]} onChange={itemChange} />
        break;
    }
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    const defaultLayout = {
      span: 4,
      xl: 4,
      lg: 6,
      md: 6,
      sm: 8,
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

  public checkBoxChange = (val: string[]) => {
    if (val.length > 0) {
      this.setState({
        setList: val,
        btnClick: false
      });
      return true;
    } else {
      this.setState({
        setList: val,
        btnClick: true
      })
      message.error('请至少选择一项展示内容')
      return false;
    }
  }

  public reset = () => {
    const { emptyForm } = this.state;
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

  public render() {
    const self = this
    const { tableAll, tableDefault, loading, btnClick } = this.state
    const { filterList, filterGrade } = this.props
    const checkBoxParams = {
      options: tableAll,
      defaultValue: tableDefault,
      onChange: this.checkBoxChange,
    }
    const search = () => {
      const { filterForm } = this.state;
      let href = window.location.href;
      if (href.indexOf('?') > -1) {
        href = href.substring(0, href.indexOf('?'))
      }
      window.location.href = `${href}?${queryString.stringify(filterForm)}`
      self.props.onSearch(filterForm)
    }
    const DataTableDOM: any =  document.querySelector('#dataTable');
    const GradeFormDOM: any = document.querySelector('#gradeForm');
    const DefaultFormDOM: any = document.querySelector('#defaultForm');
    const gradeToggle = () => {
      if (self.state.grade) {
        self.setState({
          grade: false,
          defaultTop: 0,
        })
        DataTableDOM.style.marginTop = 0;
      } else {
        
        self.setState({
          grade: true,
          defaultTop: -(GradeFormDOM.clientHeight+200),
        })
        DataTableDOM.style.marginTop = (GradeFormDOM.clientHeight - DefaultFormDOM.clientHeight) + 'px';
      }
    }
    const addFun = () => {
      self.props.onAdd();
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
        <Form id="defaultForm" style={{ top: this.state.defaultTop }} className={styles.defaultForm}>
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
        <Form id="gradeForm" className={`${styles.gradeForm} ${this.state.grade ? styles.gradeShow : null}`}>
          <Row gutter={20}>
            {
              filterGrade.length ?
                <div className={`${styles.filterGrade} ${this.state.grade ? styles.gradeShow : styles.gradeHide}`}>
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
          maskClosable={false}
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

// Filter.propTypes = {
//   filterList: PropTypes.array.isRequired,
//   filterGrade: PropTypes.array,
//   filterForm: PropTypes.object.isRequired,
//   addBtn: PropTypes.bool,
//   exportBtn: PropTypes.bool,
//   onSearch: PropTypes.func.isRequired,
//   tableList: PropTypes.array.isRequired,
//   otherList: PropTypes.array.isRequired,
//   onAdd: PropTypes.func,
//   tableSetFun: PropTypes.func.isRequired,
//   localName: PropTypes.string.isRequired,
//   outParams: PropTypes.object,
//   fetch: PropTypes.object,
// }

export default Form.create()(Filter)