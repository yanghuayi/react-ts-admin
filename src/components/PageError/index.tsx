import React from 'react'
import { Button, Row, Col } from 'antd'
import Link from 'umi/link'
import Router from 'umi/router'
import errGif from '@/assets/401.gif'

import styles from './index.less'

interface PageErrorState {
  height: number,
  errGif: string,
  ewizardClap: string,
  dialogVisible: boolean,
}

interface PageErrorProps {
  hide: () => void,
  pathname: string,
}

export default class PageError extends React.PureComponent<PageErrorProps, PageErrorState> {
  constructor(props: any) {
    super(props);
    this.state = {
      height: window.screen.availHeight,
      errGif: `${errGif}?${+new Date()}`,
      ewizardClap: 'https://wpimg.wallstcn.com/007ef517-bafd-4066-aae4-6883632d9646',
      dialogVisible: false,
    }
  }

  goHome = () => {
    Router.push('/dashboard');
    this.hide()
  };

  back = () => {
    Router.goBack();
    this.hide()
  };

  reload = () => {
    const { pathname } = this.props;
    Router.replace(pathname);
    this.hide()
  };

  hide = () => {
    const { hide } = this.props;
    if (hide) {
      hide()
    }
  };

  render() {
    const { height, errGif } = this.state;
    return (
      <div style={{ height: `${height}px` }} className={styles.errPageContainer}>
        <div className={styles.content}>
          <Row>
            <Col span={12}>
              <img src={errGif} width="313" height="428" alt="Girl has dropped her ice cream." />
            </Col>
            <Col span={12}>
              <Button type='primary' icon='arrow-left' className={styles.panBackBtn} onClick={this.back}>返回</Button>
              <h1 className={styles.textJumbo}>Oops!</h1>
              <h2>不好意思，页面报错了！</h2>
              <h6>如有不满请联系你领导</h6>
              <ul className={styles.listUnstyled}>
                <li>或者你可以去:</li>
                <li className={styles.linkType}>
                  <Link to="/dashboard">回首页</Link>
                </li>
                <li className={styles.linkType}><a onClick={this.reload}>刷新</a></li>
              </ul>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}
