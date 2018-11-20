import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN'
import React, { lazy, Suspense  } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import App from "../App";

const asyncComponent = (name: string) => {
  return lazy(() => import(`../pages/${name}`));
}

const routes: Routers[] = [
  {
    component: asyncComponent('dashboard/index'),
    path: '/dashboard',
  }
];

const AppRouter = () => (
  <LocaleProvider locale={zhCN}>
    <BrowserRouter>
      <App>
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Route exact={true} path="/" render={() => <Redirect to={{ pathname: '/dashboard' }} />} />
            {
              routes.map((item) => (
                <Route exact={true} path={item.path} component={item.component} />
              ))
            }
          </Switch>
        </Suspense>
      </App>
    </BrowserRouter>
  </LocaleProvider>
);

export default AppRouter;