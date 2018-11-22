import React, { Component } from 'react'
import { IFilterTable} from 'global';

import styles from './filterTable.less'

import Filter from './Filter'
import MTable from './MTable'

interface IFilterTableState {
  filterParams: any,
  tableParams: any,
  tableList: any,
  showFilter: boolean,
}

class FilterTable<T> extends Component<IFilterTable<T>, IFilterTableState> {
  public filterRefs = null
  constructor(props: any) {
    super(props)
    const self = this
    const { filterList, filterGrade, filterForm, fetch, addBtn, exportBtn, rowKey, opreat, tableList, otherList, localName, pagination, menuClick, scroll, onAdd, fetchError, outParams, showFilter } = this.props
    let filterParams: any = {
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
    const localList = [];
    const LocalName = window.localStorage.getItem(localName);
    if (LocalName) {
      const value = LocalName.split(',');
      for (const i in value) {
        for (const j in tableList) {
          if (value[i] === tableList[j].key) {
            localList.push(tableList[j])
          }
        }
      }
    }
    let tableParams: any = {
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
    filterParams.onSearch = (value: object) => {
      const { tableParams } = this.state;
      tableParams.fetch.data = Object.assign(value, this.props.outParams)
      this.setState({
        tableParams
      })
    },
    filterParams.tableSetFun = (value: object) => {
      window.localStorage.setItem(localName, JSON.stringify(value));
      const list = []
      for (const i in value) {
        for (const j in self.state.tableList) {
          if (value[i] === self.state.tableList[j].key) {
            list.push(self.state.tableList[j])
          }
        }
      }
      tableParams.columns = list
      self.setState({
        tableParams
      })
    }
    this.state = {
      filterParams,
      tableParams,
      tableList,
      showFilter: showFilter === undefined ? true : showFilter,
    }
  }

  public componentWillReceiveProps(nextProps: IFilterTable<T>) {
    const { filterParams, tableParams } = this.state
    filterParams.filterList = nextProps.filterList
    filterParams.filterGrade = nextProps.filterGrade
    tableParams.fetch.data = Object.assign(tableParams.fetch.data, nextProps.outParams)
    this.setState({
      filterParams,
    })
  }

  public reload() {
    const SiruiTable: any = this.refs.siruiTable;
    SiruiTable.fetch();
  }

  public reset() {
    const Filter: any = this.filterRefs;
    Filter.reset();
  }

  public render() {
    return (
      <div className={styles.tablePage}>
        {
          this.state.showFilter ?
            <Filter wrappedComponentRef={(inst: any) => this.filterRefs = inst} {...this.state.filterParams} /> : null
        }
        <MTable ref="siruiTable" {...this.state.tableParams} />
      </div>
    )
  }
}

export default FilterTable
