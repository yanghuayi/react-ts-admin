// ref: https://umijs.org/config/
import path from 'path';
function chainWebpack(config, { webpack }) {
  config.merge({
    plugin: {
      install: {
        plugin: require('uglifyjs-webpack-plugin'),
        args: [
          {
            sourceMap: false,
            uglifyOptions: {
              compress: {
                // 删除所有的 `console` 语句
                drop_console: true,
              },
              output: {
                // 最紧凑的输出
                beautify: false,
                // 删除所有的注释
                comments: false,
              },
            },
          },
        ],
      },
    },
  });
}

export default {
  history: 'hash',
  // routes,
  // chainWebpack: chainWebpack,
  hash: true,
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: true,
        title: 'react-ts-admin',
        dll: true,
        pwa: false,
        routes: {
          exclude: [/components\//],
        },
        hardSource: false,
      },
    ],
  ],
  disableRedirectHoist: true,
  copy: [
    {
      from: `${__dirname}/src/public`,
      to: 'public',
    },
  ],
  alias: {
    '@': path.resolve('src'),
  },
  proxy: {
    '/api': {
      target: 'http://fengfaan.cn/',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
  theme: {
    '@primary-color': '#0390ff',
    '@border-radius-base': '0px',
    '@border-radius-sm': '0px',
    '@shadow-color': 'rgba(0,0,0,0.05)',
    '@shadow-1-down': '4px 4px 40px @shadow-color',
    '@border-color-split': '#f4f4f4',
    '@border-color-base': '#e5e5e5',
    '@font-size-base': '13px',
    '@text-color': '#666',
  },
};
