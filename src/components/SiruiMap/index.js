import React, { PureComponent } from 'react'
import { Modal, Form, Input, Icon, Row, Col, Message, Button, Radio } from 'antd'
import { request } from 'utils'
import { Map, Marker, NavigationControl, Circle, Polyline, Polygon } from 'react-bmap'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Search = Input.Search;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
}

const loadDrawScript = () => {
  return new Promise(function (resolve, reject) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js";
    script.onerror = reject;
    document.head.appendChild(script);
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css";
    document.head.appendChild(link);
    script.onload = script.onreadystatechange = function () {
      if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
        //code
        console.log("load DrawingManager ok");
        resolve(BMapLib);
      }
      script.onload = script.onreadystatechange = null; 
    }
  })
}

class SiruiMap extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      centerPosition: {
        lng: 106.5306, // 经度
        lat: 29.5446, // 纬度
      },
      showType: false,
      akNums: 'K52pNzWT61z1EHvdZptaSmlPRc7mKbjC', // 地图ak
    }
  }

  styleOptions = {
    fillColor: "blue", //填充颜色。当参数为空时，圆形将没有填充效果。
    strokeColor: "red",
    strokeWeight: 3, //边线的宽度，以像素为单位。
    fillOpacity: 0.4, //填充的透明度，取值范围0 - 1。
    strokeOpacity: 0.4 //边线透明度，取值范围0 - 1。
  }

  componentDidMount() {
    this.props.init(this)
    if (this.props.type == 'polyon') {
      this.setState({
        showType: true
      })
    }
  }

  init = () => {
    this.initPoly()
  }

  initPoly = () => {
    let that = this;
    loadDrawScript().then(() => {
      this.map = this.refs.map.map
      let overlays = [];
      // 实例化鼠标绘制工具
      let drawingManager = new BMapLib.DrawingManager(this.map, {
        isOpen: false, // 是否开启绘制模式
        enableDrawingTool: true, // 是否显示工具栏
        drawingToolOptions: {
          anchor: BMAP_ANCHOR_TOP_RIGHT, // 位置
          offset: new BMap.Size(5, 5), // 偏离值
          drawingModes: [
            BMAP_DRAWING_CIRCLE,
            BMAP_DRAWING_POLYGON
          ]
        },
        circleOptions: that.styleOptions, //圆的样式
        polylineOptions: that.styleOptions, //线的样式
        polygonOptions: that.styleOptions, //多边形的样式
        rectangleOptions: that.styleOptions //矩形的样式
      });
      //初始化
      if (this.props.circle || this.props.polygonArr) {
        let { lng, lat, radius } = this.props.circle
        this.remark(lng, lat, radius, this.props.polygonArr)
      }
      //添加鼠标绘制工具监听事件，用于获取绘制结果
      var _impl = null;
      drawingManager.addEventListener('overlaycomplete', function (e) {
        that.map.clearOverlays();
        _impl = e.overlay;
        that.map.addOverlay(e.overlay);
        drawingManager.close();
        if (e.drawingMode == "circle") {
          var radius = parseInt(_impl.getRadius());
          var center = _impl.getCenter();
          //重画
          that.setState({
            radius,
          })
          that.remark(center.lng, center.lat, radius);
        } else if (e.drawingMode == "polygon") {
          var polygon = _impl.getPath();
          var _polygon_string = JSON.stringify(polygon);
          //重画
          that.props.change && that.props.change({
            lng: "",
            lat: "",
            radius: ""
          }, "", _polygon_string);
          //右键删除
          var _menu = new BMap.ContextMenu();
          _menu.addItem(new BMap.MenuItem('删除多边形', function () {
            that.map.removeOverlay(_impl);
          }));
          _impl.addContextMenu(_menu);
          //允许编辑
          _impl.enableEditing();
          _impl.addEventListener("lineupdate", function (e) {
            polygon = _impl.getPath();
            _polygon_string = JSON.stringify(polygon);
            debugger;
            //编辑
            that.props.change && that.props.change({
              lng: "",
              lat: "",
              radius: ""
            }, "", _polygon_string);
          })
        }
      });
    }).catch(e => {
      console.log("e:" + e);
    })
  }

  remark = (lng, lat, radius, polyon) => {
    this.keyword = "";
    let that = this;
    that.lng = lng ? lng : "";
    that.lat = lat ? lat : "";
    that.subradius = radius ? radius : "";
    if (polyon != "[]" && polyon) {
      that.poly = polyon;
      that.polygonInmap();
    } else {
      that.pointInmap();
    }
  }

  polygonInmap = () => {
    let that = this;
    var _arr = [];
    var _polyPoint = [];
    try {
      _arr = JSON.parse(that.poly);
    } catch (e) {
      console.log('error:parse poly arr' + e);
    }
    _arr.forEach((itm) => {
      let point = new BMap.Point(itm.lng, itm.lat);
      _polyPoint.push(point);
    })
    var ret = new BMap.Polygon(_polyPoint, that.styleOptions); //创建多边形
    that.map.clearOverlays();
    that.map.addOverlay(ret);
    //右键删除
    var _menu = new BMap.ContextMenu();
    _menu.addItem(new BMap.MenuItem('删除多边形', function () {
      that.map.removeOverlay(ret);
    }));
    ret.addContextMenu(_menu);
    setTimeout(function () {
      that.map.centerAndZoom(_polyPoint[0], 12);
    }, 500)
  }

  pointInmap = () => {
    //在地图上显示标注
    let that = this;
    if (!that.lng || !that.lat) {
      that.remarkCity();
      console.log(`no lat or lng`);
      return;
    }
    var point = new BMap.Point(that.lng, that.lat);
    that.marker = new BMap.Marker(point);
    that.marker.enableDragging();
    function setPoint(ev) {
      that.lng = ev.point.lng;
      that.lat = ev.point.lat;
      that.pointInmap();
    }
    //标注拖拽后的位置
    that.marker.removeEventListener("dragend", setPoint);
    that.marker.addEventListener("dragend", setPoint);
    setTimeout(function () {
      that.map.centerAndZoom(point, 15);
    }, 500)
    var geoc = new BMap.Geocoder();
    var circle = new BMap.Circle(point, that.subradius, that.styleOptions);
    geoc.getLocation(point, function (rs) {
      var addComp = rs.addressComponents;
      var _addr = (addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
      that.desc = _addr;
      var _label = new BMap.Label(_addr, {
        offset: new BMap.Size(20, -10)
      });
      that.marker.setLabel(_label);
      // 提交赋值
      that.props.change && that.props.change({
        lng: that.lng,
        lat: that.lat,
        radius: that.subradius
      }, _addr);
    });
    that.map.clearOverlays();
    that.map.addOverlay(circle);
    that.map.addOverlay(that.marker);
  }


  changeRadius = (event) => {
    let that = this;
    that.subradius = event.target.value
    that.setState({
      radius: event.target.value
    })
    if (that.lng && that.lat) {
      this.remark(that.lng, that.lat, that.subradius);
    }
  }

  // 搜索城市
  searchCity = (data) => {
    if (!data) {
      Message.error('请输入内容');
    } else {
      let loc = data;
      let { akNums } = this.state;
      request({
        url: `http://api.map.baidu.com/geocoder/v2/?address=` + loc + `&output=json&ak=` + akNums + `&callback=showLocation`,
        method: 'post',
      }).then((data) => {
        const result = data.result;
        if (result.resultCode) {
          Message.error(result.resultMessage)
        } else {
          let { centerPosition } = this.state;
          centerPosition = data.result.location;
          this.setState({
            centerPosition,
            change: !this.state.change
          });
        }
      }).catch(err => {
        Message.error(err.message)
      })
    }
  }

  // 设置城市
  remarkCity = () => {
    let that = this;
    var myCity = new BMap.LocalCity();
    that.map.clearOverlays();
    myCity.get(function(result) {
      var cityName = result.name;
      that.map.setCenter(cityName);
      setTimeout(function() {
        that.map.centerAndZoom(cityName, 15);
      }, 500)
    });
  }

  handleSetFence = () => {
    this.props.close()
  }

  render() {
    const { visible, title, width, form: { getFieldDecorator }, showType, circle, type } = this.props
    const { centerPosition, radius } = this.state
    const modalProps = {
      title,
      width,
      visible,
      onOk: this.handleSetFence,
      onCancel: this.props.close,
    }
    // 判断是为展示
    type === 'show' ? modalProps.footer = null : null
    const mapProps = {
      style: {
        width: '100%',
        height: '500px'
      },
      enableScrollWheelZoom: true,
      enableDoubleClickZoom: false,
      center: centerPosition,
      zoom: 12,
    }
    return (
      <Modal {...modalProps} >
        { 
          type != 'show' ? 
          <Row>
            <Form >
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="围栏半径"
                >
                  {getFieldDecorator('radius', {
                    initialValue: circle && circle.radius ? circle.radius : null
                  })(
                    <Input onPressEnter={this.changeRadius} addonAfter="米" />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="搜索城市"
                >
                  {getFieldDecorator('searchCity', {
                  })(
                    <Search
                      placeholder="输入搜索城市名称"
                      onSearch={(data) => this.searchCity(data)}
                      enterButton
                    />
                  )}
                </FormItem>
              </Col>
            </Form>
          </Row> : null
        }
        <Map ref="map" {...mapProps}>
        </Map>
      </Modal>
    )
  }
}

export default Form.create()(SiruiMap)