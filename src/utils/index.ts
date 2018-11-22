import lodash from 'lodash';
/**
 * 对象参数转换为url参数
 * @param   {Object}
 * @return  {String}
 */

export function getUrlParams (params: object) {
  let urlParams = '';
  for (const i in params) {
    urlParams += `${i}=${params[i]}&`
  }
  return urlParams.substring(0, urlParams.length - 2)
}


/**
 * 获取路由search参数
 * @param   {String}
 * @return  {String}
 */

export function GetQueryString(name: string) {
  let reg: RegExp | null = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  const hash = window.location.hash;
  let r = hash.substring(hash.indexOf('?'), hash.length).substr(1).match(reg);
  let context = "";
  if (r != null) {
     context = r[2];
  }
  reg = null;
  r = null;
  return context == null || context === "" || context === "undefined" ? "" : context;
}

/**
 * @param   {String}
 * @return  {String}
 */

export const queryURL = (name: string) => {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i')
  const r = window.location.search.substr(1).match(reg)
  if (r != null) { return decodeURI(r[2]) }
  return null
}

/**
 * 数组内查询
 * @param   {array}      array
 * @param   {String}    id
 * @param   {String}    keyAlias
 * @return  {Array}
 */
export const queryArray = (array: any, key: string = 'id', keyAlias: string = 'key') => {
  if (!(array instanceof Array)) {
    return null
  }
  const item = array.filter(_ => _[keyAlias] === key)
  if (item.length) {
    return item[0]
  }
  return null
}

/**
 * 数组格式转树状结构
 * @param   {array}     array
 * @param   {String}    id
 * @param   {String}    pid
 * @param   {String}    children
 * @return  {Array}
 */
export const arrayToTree = (array: any, id = 'id', pid = 'pid', children = 'children') => {
  const data = lodash.cloneDeep(array)
  const result: any = []
  const hash = {}
  data.forEach((item: any, index: number) => {
    hash[data[index][id]] = data[index]
  })

  data.forEach((item: any) => {
    const hashVP = hash[item[pid]]
    if (hashVP) {
      !hashVP[children] && (hashVP[children] = [])
      hashVP[children].push(item)
    } else {
      result.push(item)
    }
  })
  return result
}

export function levelcodeToArray(levelcode: string): string[] {
  if (!levelcode) {
    return [];
  }
  const _arr = levelcode.split("/");
  const _ret: any = [];
  _arr.length = _arr.length - 1;
  _arr.forEach((itm) => {
    _ret.push(_ret[_ret.length - 1] ? _ret[_ret.length - 1] + itm + "/" : itm + "/");
  });
  return _ret;
}