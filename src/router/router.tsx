import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN'
import * as React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import App from "../App";

import Dashboard from '../pages/dashboard/index';

const routes: Routers[] = [
  {
    component: Dashboard,
    path: '/dashboard',
  }
];

const AppRouter = () => (
  <LocaleProvider locale={zhCN}>
    <BrowserRouter>
      <App>
        <Switch>
          <Route exact={true} path="/" render={() => <Redirect to={{ pathname: '/dashboard' }} />} />
          {
            routes.map((item) => (
              <Route exact={true} path={item.path} component={item.component} />
            ))
          }
        </Switch>
      </App>
    </BrowserRouter>
  </LocaleProvider>
);

export default AppRouter;