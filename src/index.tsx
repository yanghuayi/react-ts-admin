import { Provider } from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.less';

import AppRouter from './router/router';
import AppStore from './store/app';

import registerServiceWorker from './registerServiceWorker';

const stores = {
  AppStore,
};

ReactDOM.render(
  <Provider {...stores}>
      <AppRouter />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
