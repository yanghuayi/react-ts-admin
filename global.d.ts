import { ColumnProps } from 'antd/lib/table';
import { PaginationProps } from 'antd/lib/pagination';

interface Routers {
  path: string,
  component: any,
}

interface Date {
  format: (date: string) => string
} 

interface String {
  hyphenToHump: () => string,
  humpToHyphen: () => string,
}

interface Menus {
  id: string,
  bpid: string,
  mpid: string,
  name: string,
  route: string,
  role: string,
}

interface TabList extends Menus {
  search: string,
}

interface FilterList {
  key: string,
  type: 'cascader' | 'between' | 'lower' | 'input' | 'select' | 'radio' | 'dateTime' | 'oneTime' | 'seTime',
  label: string,
  placeholder?: string,
  options?: any,
}

interface FetchData {
  url: string,
  data: object,
  dataKey: string,
}

type OpreatColor = 'blue' | 'red' | 'green' | 'orange'

interface Operat {
  key: string,
  name: (record: object) => string | string,
  disabled?: (record: object) => boolean | boolean,
  color?: (record: object) => string | OpreatColor,
  msg?: (record: object) => string | string,
}


interface IFilterTable<T> {
  filterList: FilterList[],
  filterGrade: FilterList[],
  filterForm: object,
  fetch: FetchData,
  addBtn: boolean,
  exportBtn: boolean,
  rowKey: string,
  opreat: Operat | boolean,
  tableList: Array<ColumnProps<T>>,
  otherList: any,
  localName: string,
  pagination: PaginationProps | boolean,
  menuClick: (key: string, data: object) => void,
  scroll: { x?: number, y?: number },
  onAdd: () => void,
  fetchError: (err: object) => void,
  outParams: object,
  showFilter: boolean,
}