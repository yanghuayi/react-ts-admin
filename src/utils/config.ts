import logo from '../assets/logo.png';
export default {
  name: '先特智能分销系统',
  prefix: '先特智能分销系统',
  footerText: '先特智能分销系统  © 2017 先特',
  logo: logo,
  icon: '/favicon.ico',
  openPages: ['/login'],
  baseUrl: process.env.NODE_ENV === 'production' ? '' : '/api',
};
