import React, { PureComponent } from 'react'
import Redirect from 'umi/redirect'
class Index extends PureComponent {
  render() {
    return <Redirect from='/' to={{ pathname: '/dashboard' }} />
  }
}

export default Index