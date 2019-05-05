/* global window */
import classnames from 'classnames';
import lodash from 'lodash';
import config from './config';
import { color } from './theme';

export const Config = config;
export const Color = color;
export const Classnames = classnames;
/**
 * 对象参数转换为url参数
 * @params  {Object}
 * @return  {String}
 */

export function getUrlParams(params: object) {
  let urlParams = '';
  for (let i in params) {
    urlParams += `${i}=${params[i]}&`;
  }
  return urlParams.substring(0, urlParams.length - 2);
}

/**
 * 获取路由search参数
 * @params   {String}
 * @return  {String}
 */

export function GetQueryString(name: string) {
  var reg: RegExp | null = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var hash = window.location.hash;
  var r = hash
    .substring(hash.indexOf('?'), hash.length)
    .substr(1)
    .match(reg);
  var context = '';
  if (r != null) context = r[2];
  reg = null;
  r = null;
  return context == null || context == '' || context == 'undefined' ? '' : context;
}

/**
 * @param  {String} name
 * @return  {String}
 */

export const queryURL = (name: string) => {
  let reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
  let r = window.location.search.substr(1).match(reg);
  if (r != null) return decodeURI(r[2]);
  return null;
};

/**
 * 数组内查询
 * @param   {array}      array
 * @param   {String}    id
 * @param   {String}    keyAlias
 * @return  {Array}
 */
export const queryArray = (array: any[], key: string, keyAlias = 'key') => {
  if (!(array instanceof Array)) {
    return null;
  }
  const item = array.filter(_ => _[keyAlias] === key);
  if (item.length) {
    return item[0];
  }
  return null;
};

/**
 * 数组格式转树状结构
 * @param   {array}     array
 * @param   {String}    id
 * @param   {String}    pid
 * @param   {String}    children
 * @return  {Array}
 */
export const arrayToTree = (array: any[], id = 'id', pid = 'pid', children = 'children') => {
  let data = lodash.cloneDeep(array);
  let result: any = [];
  let hash = {};
  data.forEach((item, index) => {
    hash[data[index][id]] = data[index];
  });

  data.forEach(item => {
    let hashVP = hash[item[pid]];
    if (hashVP) {
      !hashVP[children] && (hashVP[children] = []);
      hashVP[children].push(item);
    } else {
      result.push(item);
    }
  });
  return result;
};

/**
 * 返回数据类型
 * @param {*值} val
 * @returns{input} 数字 字符 {object} 对象 {array} 数组 {boolean} 布尔
 */
export function getType(val: string) {
  return 'input';
}
/**
 * 返回数据类型
 * @param {string} levelcode
 * @returns {input} 数字 字符 {object} 对象 {array} 数组 {boolean} 布尔
 */
export function levelcodeToArray(levelcode: string) {
  if (!levelcode) {
    return [];
  }
  var _arr = levelcode.split('/');
  var _ret: any[] = [];
  _arr.length = _arr.length - 1;
  _arr.forEach(itm => {
    _ret.push(_ret[_ret.length - 1] ? _ret[_ret.length - 1] + itm + '/' : itm + '/');
  });
  return _ret;
}

/**
 * @mehtod 字符串数组匹配 arr1 --> arr2
 * @param {array} arr1 字符串数组1
 * @param {array} arr2 字符串数组2
 * @return {array} backArray 返回boolean值数组
 */
export function arrayIndexOf(arr1: string[], arr2: string[]) {
  return arr2.map(item => arr1.indexOf(item) > -1);
}
/**
 * @method 加载js文件
 * @param {string} url js文件地址
 * @param {string} obj js返回对象
 */
export function jsLoad(url: string, obj: string) {
  return new Promise((resolve, reject) => {
    const script: any = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onerror = reject;
    const { head } = document;
    if (head) {
      head.appendChild(script);
    }
    script.onload = function onload() {
      if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
        resolve(obj ? window[obj] : null);
      }
      script.onload = null;
      script.onreadystatechange = null;
    };
    script.onreadystatechange = script.onload;
  });
}
/**
 * @method 加载css文件
 * @param {string} url css文件地址
 */
export function cssLoad(url: string) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  const { head } = document;
  if (head) {
    head.appendChild(link);
  }
}
/**
 * @method 清除所有cookie
 */
export function clearCookie() {
  let keys = document.cookie.match(/[^ =;]+(?=\=)/g);
  if (keys) {
    for (let i = keys.length; i--; )
      document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
  }
}
/**
 * @method 获取当前时间（YYYY-MM-DD）
 */
export function getNowFormatDate() {
  let date = new Date();
  let seperator1 = '-';
  let year = date.getFullYear();
  let month: any = date.getMonth() + 1;
  let strDate: any = date.getDate();
  if (month >= 1 && month <= 9) {
    month = '0' + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = '0' + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}

export const baseImgUrl = 'https://fanya-travelmoment.oss-cn-shanghai.aliyuncs.com/';
