import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './filterTable.less'

import Filter from './Filter'
import MTable from './MTable'

class FilterTable extends Component {
  constructor(props) {
    super(props)
    const self = this
    let { filterList, filterGrade, filterForm, fetch, addBtn, exportBtn, rowKey, opreat, tableList, otherList, localName, pagination, menuClick, scroll, onAdd, fetchError, outParams, showFilter } = this.props
    let filterParams = {
      filterList,
      filterGrade,
      filterForm,
      tableList,
      otherList,
      addBtn,
      exportBtn,
      localName,
      outParams,
      fetch,
    }
    let localList = [];
    if (window.localStorage.getItem(localName)) {
      let value = window.localStorage.getItem(localName).split(',');
      for (let i in value) {
        for (let j in tableList) {
          if (value[i] === tableList[j].key) {
            localList.push(tableList[j])
          }
        }
      }
    }
    let tableParams = {
      otherList,
      fetch,
      localName,
      rowKey,
      pagination,
      scroll,
    }
    tableParams.fetch.data = filterParams.filterForm
    filterParams.filterForm = Object.assign(filterParams.filterForm, outParams)
    filterParams = JSON.parse(JSON.stringify(filterParams))
    tableParams = JSON.parse(JSON.stringify(tableParams))
    tableParams.fetchError = fetchError
    tableParams.menuClick = menuClick
    tableParams.opreat = opreat
    tableParams.columns = localList.length ? localList : tableList
    filterParams.onAdd = onAdd
    filterParams.onSearch = (value) => {
      let { tableParams } = this.state;
      tableParams.fetch.data = Object.assign(value, this.props.outParams)
      this.setState({
        tableParams: tableParams
      })
    },
      filterParams.tableSetFun = (value) => {
        window.localStorage.setItem(localName, value)
        let list = []
        for (let i in value) {
          for (let j in self.state.tableList) {
            if (value[i] === self.state.tableList[j].key) {
              list.push(self.state.tableList[j])
            }
          }
        }
        tableParams.columns = list
        self.setState({
          tableParams: tableParams
        })
      }
    this.state = {
      filterParams,
      tableParams,
      tableList,
      showFilter: showFilter == undefined ? true : showFilter,
    }
  }

  componentWillReceiveProps(nextProps) {
    let { filterParams, tableParams } = this.state
    filterParams.filterList = nextProps.filterList
    filterParams.filterGrade = nextProps.filterGrade
    tableParams.fetch.data = Object.assign(tableParams.fetch.data, nextProps.outParams)
    this.setState({
      filterParams,
    })
  }

  reload() {
    this.refs.siruiTable.fetch()
  }

  filterRefs = null

  reset() {
    this.filterRefs.reset();
  }

  render() {
    return (
      <div className={styles.tablePage}>
        {
          this.state.showFilter ?
            <Filter wrappedComponentRef={(inst) => this.filterRefs = inst} {...this.state.filterParams} /> : null
        }
        <MTable ref="siruiTable" {...this.state.tableParams} />
      </div>
    )
  }
}

FilterTable.propTypes = {
  outParams: PropTypes.object,
  filterList: PropTypes.array.isRequired,
  filterGrade: PropTypes.array,
  filterForm: PropTypes.object,
  addBtn: PropTypes.bool,
  exportBtn: PropTypes.bool,
  onAdd: PropTypes.func,
  fetch: PropTypes.object.isRequired,
  tableList: PropTypes.array.isRequired,
  otherList: PropTypes.array,
  opreat: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool,
  ]),
  rowKey: PropTypes.string.isRequired,
  localName: PropTypes.string.isRequired,
  menuClick: PropTypes.func,
  scroll: PropTypes.object,
  pagination: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
  fetchError: PropTypes.func.isRequired,
}

export default FilterTable
