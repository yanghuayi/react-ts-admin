import React from 'react'
import { ColumnProps } from 'antd/lib/table';
import { PaginationProps } from 'antd/lib/pagination';
import { Table, message, Popconfirm } from 'antd'
import DropOption from '../DropOption/DropOption'
import styles from './MTable.less'

interface IDataTableProps<T> {
  otherList: any,
  fetch: FetchData,
  localName: string,
  rowKey: string,
  pagination: PaginationProps,
  scroll: { x?: number, y?: number },
  fetchError: (err: any) => void,
  menuClick: (key: string, data: any) => void,
  opreat: Operat[] | boolean,
  columns: Array<ColumnProps<T>>,
}

interface IDataTableState {
  loading: boolean,
  dataSource: object[],
  fetch: FetchData,
  fetchData: { rows: number, page: number },
  pagination: PaginationProps,
}

class DataTable<T> extends React.Component<IDataTableProps<T>, IDataTableState> {
  constructor(props: IDataTableProps<T>) {
    super(props)
    let {
      fetch,
    } = props
    const {
      pagination = {
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number) => `共 ${total} 条`,
        current: 1,
        total: 100,
      },
    } = props;
    fetch = JSON.parse(JSON.stringify(fetch))
    this.state = {
      loading: false,
      dataSource: [],
      fetch,
      fetchData: {
        rows: 10,
        page: 1,
      },
      pagination,
    }
  }

  public componentDidMount() {
    const hash = window.location.hash
    if (this.props.fetch && hash.indexOf('?') < 0) {
      this.fetch('init')
    }
  }

  public componentWillReceiveProps(nextProps: IDataTableProps<T>) {
    if (JSON.stringify(this.state.fetch.data) !== JSON.stringify(nextProps.fetch.data)) {
      this.setState({
        fetch: JSON.parse(JSON.stringify(nextProps.fetch)),
      }, () => {
        const { fetchData } = this.state;
        fetchData.page = 1;
        this.setState({
          fetchData,
        }, () => {
          this.fetch('update')
        })
      })
    }
  }

  public handleTableChange = (pagination: PaginationProps, filters: any) => { // 第三个参数 sorter 排序
    const pager = this.state.pagination
    const { fetchData } = this.state
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

  protected fetch = (type: string) => {
    const { fetch: { url, data, dataKey } } = this.props
    const { fetchData } = this.state
    this.setState({ loading: true })
    window.API.request({
      url,
      method: 'POST',
      data: {
        ...data,
        ...fetchData,
      },
    }).then((data: any) => {
      const result = data.result
      const tableData = data.entity
      if (!this.refs.DataTable) {
        return
      }
      if (!result.resultCode) {
        const { pagination } = this.state
        if (typeof pagination !== 'boolean') {
          pagination.total = data.entity.totalRow
        }
        this.setState({
          loading: false,
          dataSource: dataKey ? tableData[dataKey] : tableData.data,
          pagination,
        })
      } else {
        message.error(result.resultMessage);
        this.props.fetchError(data)
      }
    }).catch((error: any) => {
      this.setState({ loading: false })
      message.error(error.message)
      this.props.fetchError(error)
    })
  }

  public render() {
    const self = this
    const { fetch, rowKey, scroll, opreat, ...tableProps } = this.props
    const { loading, dataSource, pagination } = this.state
    // if (!scroll) {
    //   scroll = {
    //     y : document.body.clientHeight - 240
    //   }
    // } else if (!scroll.y) {
    //   scroll.y = document.body.clientHeight - 240
    // }
    if (opreat) {
      if (tableProps.columns[tableProps.columns.length - 1].title !== '操作') {
        if (typeof opreat === 'object' && opreat.length < 5) {
          tableProps.columns.push({
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            width: opreat.length * 60,
            render(text, record) {
              const whiteList = ['red', 'orange']
              return <div className={styles.tableLink}>{
                opreat.map((item) => {
                  if (item.disabled && item.disabled(record)) {
                    return <a key={item.key} href="javascript:;" className={styles.linkDisabled}>{typeof item.name === 'function' ? item.name(record) : item.name}</a>
                  } else if ((typeof item.color === 'function' && whiteList.indexOf(item.color(record)) >= 0) || whiteList.indexOf(typeof item.color === 'string' ? item.color : '') >= 0) {
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
          const OPreat = typeof opreat === 'object' ? opreat : [];
          tableProps.columns.push({
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            render(text, record) {
              return <DropOption onMenuClick={e => self.props.menuClick(e.key, record)} record={record} menuOptions={OPreat} />
            },
          })
        }
      }
    }
    return (<Table
      ref="DataTable"
      size="middle"
      id="dataTable"
      bordered={true}
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

export default DataTable
