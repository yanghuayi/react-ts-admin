## 概述
`FilterTable`是基于孚之科业务提炼，封装的表格筛选插件，并包含了常用的几种使用情景的配置。
## 参数列表
|   参数名称   |   说明  |     类型     |  默认值 | 
|-------------|:--------------:|-------:|-------:|
| filterList |  筛选表单列表参数 | `Array` | -- |
| filterGrade |  高级筛选表单列表参数 | `Array` | -- |
| filterForm | 筛选表单的保存值   | `Object` | -- |
| addBtn | 是否显示新增按钮 |    `Boolean` | false |
| onAdd | 新增回调事件 |    `Function` | -- |
| scroll | 表格滚动设置，具体请参考[antd文档](http://ant-design.gitee.io/components/table-cn/#Table) | -- |
| fetch | 表格请求参数 |    `Object` | -- |
| tableList | 表格列的配置描述，具体参考antd table组件的[columns](http://ant-design.gitee.io/components/table-cn/#Table) | -- | -- |
| otherList | 额外的展开行 |    `Object` | -- |
| opreat | 操作栏参数 |    `Object` | -- |
| rowKey | 行ID，用于区分每行数据 |    `Object` | -- |
| localName | 本地存储表格配置名称 |    `String` | -- |
| menuClick | 操作栏点击回调事件 |    `Function` | -- |
| pagination |  具体请参考[antd](http://ant-design.gitee.io/components/pagination-cn/#API)分页参数, 布尔值只能传false, 代表没有分页 |    `Boolean/Object` | -- |
| fetchError | 请求数据错误回调事件 |    `Function` | -- |
| exportBtn | 是否暂时导出按钮 |    `Boolean` | -- |
| exportFun | 导出回调事件 |    `Function` | -- |
| outParams | 外部请求参数 |    `Object` | -- |

## 参数说明

#### 1、filterList

```
/**
* 
* @params key (字段id,必须跟filterForm里的字段一样)
* @params type (表单类型，有10个类型，详情请看下面的type类型说明)
* @params label (用于表单前的名称)
* @params placeholder (表单的提示文字)
* @params options 有选择项的type 类型必有 options 参数
**/
/**
* @params type 类型说明
* @type cascader 联动选择（常用于机构/省市区）
* @type between 区间选择（常用于最大最小值）多一个value参数，value:['start', 'end'],
  placesholder: ['开始', '结束'] placesholder为数组格式
* @type lower 
* @type input 输入框（不解释）
* @type select 选择框 (参考antd的select组件)
* @type radio 单选框 (参考[antd]的radio组件)
* @type dateTime 时间选择带时分秒 (参考antd的TimePicker组件)
* @type oneTime 时间选择不带时分秒 （同上）
* @type seTime 区间时间选择带时分秒 （同上）多一个value参数，value:['start', 'end'],
  placesholder: ['开始', '结束'] placesholder为数组格式
**/

// 示例
filterList: [
  { key: 'input', type: 'input', label: '输入框', placeholder: '请输入' },
  { key: 'cascader', type: 'cascader', label: '联动选择', placeholder: '常用于机构/省市区'. options: [] }, 
  { key: 'between', type: 'between', label: '区间数据', placeholder: '常用于最大最小值' },
]
```
#### 2、filterForm

```
/**
* Object类型，就是filterList里key的集合，可以比filterList里面的key多, 相当于默认参数，但是初始化后不能改变
**/

// 示例
filterForm:{ title: '', point: '-1', createStartTime: '', createEndTime: '', publishStatus: '-1', examineStatus: '-1' }
```
#### 3、addBtn

```
/**
* addBtn 是否展示新增按钮
**/

// 示例
addBtn: true
```

#### 4、filterGrade

```
/**
* filterGrade 跟filterList一样
**/

// 示例
filterGrade: [
  { key: 'title', type: 'input', label: '广告名称', placeholder: '请输入广告名称' },
  { key: 'point', type: 'select', label: '广告位置', placeholder: '请选择广告位置', options: [] },
  { key: 'adddate', type: 'seTime', label: '创建时间', value: ['createStartTime', 'createEndTime'], placeholder: ['开始时间', '结束时间'] },
  { key: 'publishStatus', type: 'select', label: '发布状态', placeholder: '请选择发布状态', options: [] },
  { key: 'examineStatus', type: 'select', label: '审核状态', placeholder: '请选择审核状态', options: [] },
],
```
#### 5、onAdd

```
/**
* onAdd 新增回调事件
**/

// 示例
render () {
    let { FilterTableParams } = this.state
    FilterTableParams.onAdd = this.addFun
    return (
        <FilterTable ref="infoPublicTable" {...FilterTableParams} />
    )
}
```

#### 6、scroll

```
/**
* scroll 表格滚动参数，具体请参考antd文档
**/

// 示例
scroll: { x: '800px', y: 'auto' }
```
#### 7、fetch

```
/**
* fetch 请求参数
* @params url 请求地址
* @params data 请求数据
* @params dataKey: 返回数据字段名，字段必须在entity里面
**/

// 示例
fetch: { url: `${APIV2}/msg/info/list`, data: () => this.filterForm, dataKey: 'list' },
```

#### 8、tableList

```
/**
* tableList 表格参数，就是antd-table里的Columns参数
参考地址：https://github.com/ant-design/ant-design/blob/1bf0bab2a7bc0a774119f501806e3e0e3a6ba283/components/table/Column.tsx#L4
**/

// 示例
tableList: [
  { title: '广告名称', dataIndex: 'title', key: 'title' },
  {
    title: '广告位置',
    dataIndex: 'point',
    key: 'point',
    render: (text, record) => {
      let { locPoints } = this.state;
      for (let i in locPoints) {
        if (locPoints[i].id === text) {
          return locPoints[i].name
        }
      }
    }
  },
  // { title: '排序', dataIndex: 'seq', key: 'seq' },
  { title: '创建人', dataIndex: 'creator', key: 'creator' },
  { title: '创建时间', dataIndex: 'adddate', key: 'adddate' },
  {
    title: '开始展示时间',
    dataIndex: 'showStartTime',
    key: 'showStartTime',
    render: (text, record) => text == null ? '--' : text
  },
  {
    title: '审核状态',
    dataIndex: 'examineStatus',
    key: 'examineStatus',
    render: (text, record) => {
      let { listExamineOptions } = this.state;
      for (let i in listExamineOptions) {
        if (listExamineOptions[i].key === text) {
          return <Tag color={listExamineOptions[i].color}>{listExamineOptions[i].label}</Tag>
        }
      }
    }
  },
  {
    title: '审核意见',
    dataIndex: 'memo',
    key: 'memo',
    render: (text, record) => {
      return record.examineStatus == 3 ? <Tag color="blue" onClick={(e) => this.handleShowMemo(record)} className={styles.checkMemo}>查看意见</Tag> : <Tag>暂无意见</Tag>
    }
  },
  {
    title: '展示状态',
    dataIndex: 'showType',
    key: 'showType',
    render: (text, record) => {
      let { showTypeStateOptions } = this.state;
      for (let i in showTypeStateOptions) {
        if (showTypeStateOptions[i].key === text) {
          return <Tag color={showTypeStateOptions[i].color} > {showTypeStateOptions[i].label} </Tag>
        }
      }
    }
  },
]
```

#### 9、otherList

```
/**
* otherList 待完善
**/

// 示例
```

#### 10、opreat

```
/**
* opreat 操作栏参数
* @params key 操作ID，用于在回调事件中判断
* @params name 操作名称
* @params disabled 是否可点击 Function 类型，返回Boolean值
* @params color 操作文字颜色，有4种，blue, red, green, orange
* @params msg 操作提示文字，当有这个参数的时候，点击会有操作提示
**/

// 示例
opreat: [
  {
    key: 1,
    name: '编辑',
    disabled: (data) => {
      let arr = [0, 3, 4]
      return arr.indexOf(data.examineStatus) > -1 ? false : true
    },
    color: 'blue'
  },
  {
    key: 2,
    name: '删除',
    disabled: (data) => {
      let arr = [0, 3, 4]
      return arr.indexOf(data.examineStatus) > -1 ? false : true
    },
    color: 'red',
    msg: '确定删除吗？'
  },
  {
    key: 3,
    name: '提审',
    disabled: (data) => {
      let arr = [0, 3, 4]
      return arr.indexOf(data.examineStatus) > -1 ? false : true
    },
    color: 'green',
  },
  {
    key: 4,
    name: '下架',
    color: 'red',
    disabled: (data) => {
      let arr = [2]
      return arr.indexOf(data.examineStatus) > -1 ? false : true
    },
    msg: '确定下架吗？'
  }
],
```

#### 12、menuClick

```
/**
* menuClick 回调事件
**/

// 示例
tableOpreat = (val, data) => {
    // val 返回的opreat的key值
    // data 当前行的数据
}
render () {
    let { FilterTableParams } = this.state
    FilterTableParams.menuClick = this.tableOpreat
}
```
#### 11、menuClick

```
/**
* menuClick 回调事件
**/

// 示例
tableOpreat = (val, data) => {
    // val 返回的opreat的key值
    // data 当前行的数据
}
render () {
    let { FilterTableParams } = this.state
    FilterTableParams.menuClick = this.tableOpreat
}
```

#### 12、pagination

```
/**
* pagination 分页参数
* 一般不用填 除非有特殊需求
**/
// 默认值
{
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: total => `共 ${total} 条`,
    current: 1,
    total: 100,
},
// 示例
```

#### 13、fetchError

```
/**
* fetchError 请求报错回调
* 一般用于判断是否是登陆超时
**/

// 示例
fetchError = (err) => {
    if (err.result.resultCode === 3) {
        this.props.dispatch({ type: 'app/logout' })
    }
}
render () {
    let { FilterTableParams } = this.state
    FilterTableParams.fetchError = this.fetchError
}
```

#### 14、exportFun

```
/**
* exportFun 导出回调事件
* 
**/

// 示例
exportFun = () => {
    // 导出操作
}
render () {
    let { FilterTableParams } = this.state
    FilterTableParams.exportFun = this.exportFun
}
```

#### 15、outParams

```
/**
* outParams 外部参数
* 用于动态改变的外部参数
**/

// 示例
render () {
    let { FilterTableParams, outParams } = this.state
    FilterTableParams.outParams =  outParams
}
```