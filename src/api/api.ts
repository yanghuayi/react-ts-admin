import axios from 'axios';
import qs from 'qs';
import jsonp from 'jsonp';
import lodash from 'lodash';
import { message } from 'antd';

interface IApiList {
  [key: string]: {
    url: string, // 请求地址
    fetchType?: string, // 数据格式，支持json,formData
    method?: string, // 请求方法
    headers?: any // 头部携带信息
  }
}

interface IOptions {
  data?: any,
  url: string,
  fetchType?: string,
  method?: string,
  headers?: any
}

interface IApis {
  [key: string]: any
}

export default class Api {
  public service: any = null
  // 请求列表，在这里添加相应接口
  public apiList: IApiList = {
    login: {
      url: '/user/login',
      fetchType: 'json',
      method: 'post',
    },
    logout: {
      url: '/user/logout',
      fetchType: 'json',
      method: 'post',
    },
    getUserInfo: {
      url: '/user/getUserInfo',
      fetchType: 'json',
      method: 'post',
    },
    dashboard: {
      url: '/dashboard',
      fetchType: 'json',
      method: 'post',
    },
    baseInfoAdd: {
      url: '/customers/baseInfo/add',
      fetchType: 'json',
      method: 'post',
    },
    baseInfoUpdate: {
      url: '/customers/baseInfo/update',
      fetchType: 'json',
      method: 'post',
    },
    baseInfoDelete: {
      url: '/customers/baseInfo/delete',
      fetchType: 'json',
      method: 'post',
    },
    gpsToAddress: {
      url: 'https://api.map.baidu.com/geocoder/v2/',
      method: 'get',
      fetchType: 'jsonp',
    },
  }
  // 对外暴露方法
  public api: IApis = {}
  public baseUrl: string = ''
  constructor(options: { baseUrl: string }) {
    axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    this.baseUrl = this.baseUrl;
    this.service = axios.create({
      baseURL: options.baseUrl, // api的base_url
      timeout: 20000, // 请求超时时间
    });
    for (const i in this.apiList) {
      this.api[i] = (data: any) => {
        const url = this.apiList[i].url;
        if (i === 'gpsToAddress') {
          data = {
            callback: 'renderReverse',
            coordtype: data.coordinateSystem,
            location: `${data.lat},${data.lng}`,
            output: 'json',
            pois: 1,
            ak: '3oWu5SgExpeyXtRXbuDdRO08CoVMTloM',
          };
        }
        return this.request({
          method: this.apiList[i].method,
          data,
          fetchType: this.apiList[i].fetchType,
          url,
          headers: this.apiList[i].headers,
        });
      };
    }
  }

  public request = (options: IOptions) => this.fetch(options).then((response: any) => {
    const { statusText, status } = response;
    let { data } = response;
    if (data instanceof Array) {
      data = {
        list: data,
      };
    }
    // 登录超时判断
    if (response.data.result && response.data.result.resultCode === 3) {
      // router.replace({ name: 'login' });
      return Promise.reject({
        success: false,
        message: response.data.result.resultMessage,
      });
    }
    return Promise.resolve({
      success: true,
      message: statusText,
      statusCode: status,
      data,
    });
  }).catch((error: any) => {
    const { response } = error;
    let msg;
    let statusCode;
    if (response && response instanceof Object) {
      const { data, statusText } = response;
      statusCode = response.status;
      msg = data.message || statusText;
    } else {
      statusCode = 600;
      msg = error.message || 'Network Error';
    }
    message.error(msg);
    return Promise.reject({ success: false, statusCode, message: msg });
  })

  public fetch = (options: IOptions) => {
    const {
      url, data, fetchType, method = 'get',
    } = options;
    let cloneData: any = lodash.cloneDeep(data);
    cloneData = qs.stringify(cloneData);
    const headers = {
      token: window.localStorage.getItem('token'),
      ...options.headers,
    };

    if (fetchType === 'jsonp') {
      return new Promise((resolve, reject) => {
        jsonp(url, {
          param: `${qs.stringify(data)}&callback`,
          name: `jsonp_${new Date().getTime()}`,
          timeout: 4000,
        }, (error, result) => {
          if (error) {
            reject(error);
          }
          resolve({ statusText: 'OK', status: 200, data: result });
        });
      });
    } else if (fetchType === 'json') {
      return this.service({
        url,
        method: method.toLowerCase(),
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        data,
      });
    } else if (fetchType === 'jsonfile') {
      return axios.get(url, { headers });
    }
    switch (method.toLowerCase()) {
      case 'get':
        return this.service.get(`${url}?${cloneData}`, { headers });
      case 'delete':
        return this.service.delete(url, {
          data: cloneData,
        }, { headers });
      case 'post':
        return this.service.post(url, cloneData, { headers });
      case 'put':
        return this.service.put(url, cloneData, { headers });
      case 'patch':
        return this.service.patch(url, cloneData, { headers });
      default:
        return this.service(options);
    }
  }
}
