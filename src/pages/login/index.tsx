import React, { Component } from 'react';
import { Form, Input, Button, Row, Icon } from 'antd';
import { connect } from 'dva';
import { FormComponentProps } from 'antd/lib/form';
import { Config } from '@/utils/index';
import styles from './login.less';
import { Dispatch } from 'redux';

const FormItem = Form.Item;

interface LoginProps {
  loading: any;
  login: any;
  dispatch: Dispatch<object>;
}

interface LoginStates {
  authCodeImg: string;
}

@connect(({ loading, login }: any) => ({ loading, login }))
class Login extends Component<LoginProps & FormComponentProps, LoginStates> {
  constructor(props: LoginProps & FormComponentProps) {
    super(props);
    this.state = {
      authCodeImg: '',
    };
  }

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return;
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      loading,
      login,
    } = this.props;
    console.log(loading.effects);
    return (
      <div className={styles.loginWrap}>
        <div className={styles.loginBox}>
          <div className={styles.logo}>
            <img alt="logo" src={Config.logo} />
            <span>{Config.name}</span>
          </div>
          <Form>
            <FormItem hasFeedback>
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: '请输入用户名',
                  },
                ],
              })(
                <Input
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  onPressEnter={this.handleOk}
                  placeholder="用户名"
                />
              )}
            </FormItem>
            <FormItem hasFeedback>
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    message: '请输入密码',
                  },
                ],
              })(
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  onPressEnter={this.handleOk}
                  placeholder="密码"
                />
              )}
            </FormItem>
            <FormItem hasFeedback>
              {getFieldDecorator('inputRandomCode', {
                rules: [
                  {
                    required: true,
                    message: '请输入验证码',
                  },
                ],
              })(
                <Input
                  prefix={<Icon type="code" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="text"
                  onPressEnter={this.handleOk}
                  placeholder="验证码"
                />
              )}
              <img src={login.authCodeImg} className={styles.authcodeImg} alt="authCode" />
            </FormItem>
            <Row>
              <Button type="primary" onClick={this.handleOk}>
                登录
              </Button>
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}

export default Form.create()(Login);
