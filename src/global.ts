import api from '@/api/api';
import config from '@/utils/config';
// 初始化api
window.api = new api({ baseUrl: config.baseUrl }).api;
