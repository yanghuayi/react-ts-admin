import React from 'react'
import PropTypes from 'prop-types'
import { Table, Message, Popconfirm } from 'antd'
import { request } from 'utils'
import DropOption from '../DropOption/DropOption'
import styles from './MTable.less'

class DataTable extends React.Component {
  constructor(props) {
    super(props)
    let {
      dataSource = [],
      fetch,
      pagination = {
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total => `共 ${total} 条`,
        current: 1,
        total: 100,
      },
    } = props
    fetch = JSON.parse(JSON.stringify(fetch))
    this.state = {
      loading: false,
      dataSource,
      fetch,
      fetchData: {
        rows: 10,
        page: 1,
      },
      pagination,
    }
  }

  componentDidMount() {
    let hash = window.location.hash
    if (this.props.fetch && hash.indexOf('?') < 0) {
      this.fetch('init')
    }
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.state.fetch.data) !== JSON.stringify(nextProps.fetch.data)) {
      this.setState({
        fetch: JSON.parse(JSON.stringify(nextProps.fetch)),
      }, () => {
        let { fetchData } = this.state;
        fetchData.page = 1;
        this.setState({
          fetchData,
        }, () => {
          this.fetch('update')
        })
      })
    }
  }

  handleTableChange = (pagination, filters) => { // 第三个参数 sorter 排序
    let pager = this.state.pagination
    let { fetchData } = this.state
    if (pager.current !== pagination.current || fetchData.rows !== pagination.pageSize || fetchData.page !== pagination.current) {
      pager.current = pagination.current
      this.setState({
        pagination: pager,
        fetchData: {
          rows: pagination.pageSize,
          page: pagination.current,
          ...filters,
        },
      }, () => {
        this.fetch('change')
      })
    }
  }

  fetch = (type) => {
    const { fetch: { url, data, dataKey } } = this.props
    const { fetchData } = this.state
    this.setState({ loading: true })
    request({
      url,
      method: 'POST',
      data: {
        ...data,
        ...fetchData,
      },
    }).then((data) => {
      const result = data.result
      const tableData = data.entity
      if (!this.refs.DataTable) {
        return
      }
      if (!result.resultCode) {
        let { pagination } = this.state
        if (typeof pagination !== 'boolean') {
          pagination.total = data.entity.totalRow
        }
        this.setState({
          loading: false,
          dataSource: dataKey ? tableData[dataKey] : tableData.data,
          pagination,
        })
      } else {
        Message.error(result.resultMessage);
        this.props.fetchError(data)
      }
    }).catch((error) => {
      this.setState({ loading: false })
      Message.error(error.message)
      this.props.fetchError(error)
    })
  }

  render() {
    const self = this
    let { fetch, rowKey, scroll, ...tableProps } = this.props
    const { loading, dataSource, pagination } = this.state
    // if (!scroll) {
    //   scroll = {
    //     y : document.body.clientHeight - 240
    //   }
    // } else if (!scroll.y) {
    //   scroll.y = document.body.clientHeight - 240
    // }
    if (this.props.opreat) {
      if (tableProps.columns[tableProps.columns.length - 1].title !== '操作') {
        if (this.props.opreat.length < 5) {
          tableProps.columns.push({
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            width: self.props.opreat.length * 60,
            render(text, record) {
              let whiteList = ['red', 'orange']
              return <div className={styles.tableLink}>{
                self.props.opreat.map((item) => {
                  if (item.disabled && item.disabled(record)) {
                    return <a key={item.key} href="javascript:;" className={styles.linkDisabled}>{typeof item.name === 'function' ? item.name(record) : item.name}</a>
                  } else if ((typeof item.color === 'function' && whiteList.indexOf(item.color(record)) >= 0) || whiteList.indexOf(item.color) >= 0) {
                    return <Popconfirm title={typeof item.msg === 'function' ? item.msg(record) : item.msg} key={item.key} onConfirm={e => self.props.menuClick(item.key, record)} okText="确定" cancelText="取消">
                      <a href="javascript:;" className={styles[`link-${typeof item.color === 'function' ? item.color(record) : item.color}`]}>{typeof item.name === 'function' ? item.name(record) : item.name}</a>
                    </Popconfirm>
                  } else {
                    return <a href="javascript:;" className={styles[`link-${typeof item.color === 'function' ? item.color(record) : item.color}`]} key={item.key} onClick={e => self.props.menuClick(item.key, record)}>{typeof item.name === 'function' ? item.name(record) : item.name}</a>
                  }
                })
              }
              </div>
            },
          })
        } else {
          tableProps.columns.push({
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            render(text, record) {
              return <DropOption onMenuClick={e => self.props.menuClick(e.key, record)} record={record} menuOptions={self.props.opreat} />
            },
          })
        }
      }
    }
    return (<Table
      ref="DataTable"
      size="middle"
      id="dataTable"
      bordered
      scroll={scroll}
      className={styles.dataTable}
      loading={loading}
      onChange={this.handleTableChange}
      {...tableProps}
      rowKey={record => record[rowKey]}
      pagination={pagination}
      dataSource={dataSource}
    />)
  }
}


DataTable.propTypes = {
  fetch: PropTypes.object.isRequired,
  rowKey: PropTypes.string.isRequired,
  pagination: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
  columns: PropTypes.array.isRequired,
  opreat: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool,
  ]),
  otherList: PropTypes.array,
  menuClick: PropTypes.func,
  localName: PropTypes.string.isRequired,
  dataSource: PropTypes.array,
  scroll: PropTypes.object,
  fetchError: PropTypes.func.isRequired,
}

export default DataTable
