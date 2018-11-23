import React, { PureComponent } from 'react'
import { Modal, Form, Input, Row, Col, message } from 'antd'
import { Map } from 'react-bmap'
import {WrappedFormUtils} from "antd/lib/form/Form";
import {ModalProps} from "antd/lib/modal";

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
  return new Promise((resolve, reject) => {
    const script: any = document.createElement("script");
    script.type = "text/javascript";
    script.src = "http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js";
    script.onerror = reject;
    const Head: any = document.head;
    Head.appendChild(script);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css";
    Head.appendChild(link);
    script.onload = script.onreadystatechange = function () {
      if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
        // code
        console.log("load DrawingManager ok");
        resolve(window.BMapLib);
      }
      script.onload = script.onreadystatechange = null; 
    }
  })
}

interface ISiruiMapProps {
  init: (map: SiruiMap) => void,
  type: 'polyon' | 'show',
  circle: {lng: number, lat: number, radius: number},
  polygonArr: string,
  change: (circle: { lat: number, lng: number, radius: number }, type: string, _polygon_string?: string) => void,
  close: () => void,
  visible: boolean,
  title: string,
  width: number,
  form: WrappedFormUtils,
}

interface ISiruiMapState {
  centerPosition: { lat: number, lng: number },
  showType: boolean,
  akNums: string,
  radius: number,
  change: boolean,
}

class SiruiMap extends PureComponent<ISiruiMapProps, ISiruiMapState> {
  public map: any;
  constructor(props: any) {
    super(props)
    this.state = {
      centerPosition: {
        lng: 106.5306, // 经度
        lat: 29.5446, // 纬度
      },
      radius: 0,
      change: false,
      showType: false,
      akNums: 'K52pNzWT61z1EHvdZptaSmlPRc7mKbjC', // 地图ak
    }
  }

  public styleOptions = {
    fillColor: "blue", // 填充颜色。当参数为空时，圆形将没有填充效果。
    strokeColor: "red",
    strokeWeight: 3, // 边线的宽度，以像素为单位。
    fillOpacity: 0.4, // 填充的透明度，取值范围0 - 1。
    strokeOpacity: 0.4 // 边线透明度，取值范围0 - 1。
  };

  public componentDidMount() {
    this.props.init(this);
    if (this.props.type === 'polyon') {
      this.setState({
        showType: true
      })
    }
  }

  public init = () => {
    this.initPoly();
  };

  public initPoly = () => {
    const that = this;
    loadDrawScript().then(() => {
      const Map: any = this.refs.map;
      this.map = Map.map;
      // 实例化鼠标绘制工具
      const drawingManager = new window.BMapLib.DrawingManager(this.map, {
        isOpen: false, // 是否开启绘制模式
        enableDrawingTool: true, // 是否显示工具栏
        drawingToolOptions: {
          anchor: window.BMAP_ANCHOR_TOP_RIGHT, // 位置
          offset: new window.BMap.Size(5, 5), // 偏离值
          drawingModes: [
            window.BMAP_DRAWING_CIRCLE,
            window.BMAP_DRAWING_POLYGON
          ]
        },
        circleOptions: that.styleOptions, // 圆的样式
        polylineOptions: that.styleOptions, // 线的样式
        polygonOptions: that.styleOptions, // 多边形的样式
        rectangleOptions: that.styleOptions // 矩形的样式
      });
      // 初始化
      if (this.props.circle || this.props.polygonArr) {
        const { lng, lat, radius } = this.props.circle
        this.remark(lng, lat, radius, this.props.polygonArr)
      }
      // 添加鼠标绘制工具监听事件，用于获取绘制结果
      let _impl: any = null;
      drawingManager.addEventListener('overlaycomplete', (e: any) => {
        that.map.clearOverlays();
        _impl = e.overlay;
        that.map.addOverlay(e.overlay);
        drawingManager.close();
        if (e.drawingMode === "circle") {
          const radius = parseInt(_impl.getRadius(), 10);
          const center = _impl.getCenter();
          // 重画
          that.setState({
            radius,
          });
          that.remark(center.lng, center.lat, radius);
        } else if (e.drawingMode === "polygon") {
          let polygon = _impl.getPath();
          let _polygon_string = JSON.stringify(polygon);
          // 重画
          that.props.change && that.props.change({
            lng: 0,
            lat: 0,
            radius: 0
          }, "", _polygon_string);
          // 右键删除
          const _menu = new window.BMap.ContextMenu();
          _menu.addItem(new window.BMap.MenuItem('删除多边形', () => {
            that.map.removeOverlay(_impl);
          }));
          _impl.addContextMenu(_menu);
          // 允许编辑
          _impl.enableEditing();
          _impl.addEventListener("lineupdate", () => {
            polygon = _impl.getPath();
            _polygon_string = JSON.stringify(polygon);
            // 编辑
            that.props.change && that.props.change({
              lng: 0,
              lat: 0,
              radius: 0
            }, "", _polygon_string);
          })
        }
      });
    }).catch(e => {
      console.log("e:" + e);
    })
  };

  public keyword: string;

  public lat: number;
  public lng: number;
  public subradius: number;
  public poly: string;

  public remark = (lng: number, lat: number, radius?: number, polyon?: string) => {
    this.keyword = "";
    const that = this;
    that.lng = lng ? lng : 0;
    that.lat = lat ? lat : 0;
    that.subradius = radius ? radius : 0;
    if (polyon !== "[]" && polyon) {
      that.poly = polyon;
      that.polygonInMap();
    } else {
      that.pointInMap();
    }
  }

  public polygonInMap = () => {
    const that = this;
    let _arr = [];
    const _polyPoint: Array<{ lat: number, lng: number }> = [];
    try {
      _arr = JSON.parse(that.poly);
    } catch (e) {
      console.log('error:parse poly arr' + e);
    }
    _arr.forEach((itm: { lat: number, lng: number }) => {
      const point = new window.BMap.Point(itm.lng, itm.lat);
      _polyPoint.push(point);
    });
    const ret = new window.BMap.Polygon(_polyPoint, that.styleOptions); // 创建多边形
    that.map.clearOverlays();
    that.map.addOverlay(ret);
    // 右键删除
    const _menu = new window.BMap.ContextMenu();
    _menu.addItem(new window.BMap.MenuItem('删除多边形', () => {
      that.map.removeOverlay(ret);
    }));
    ret.addContextMenu(_menu);
    setTimeout(() => {
      that.map.centerAndZoom(_polyPoint[0], 12);
    },500)
  };

  public marker: any;
  public desc: string;

  public pointInMap = () => {
    // 在地图上显示标注
    const that = this;
    if (!that.lng || !that.lat) {
      that.remarkCity();
      console.log(`no lat or lng`);
      return;
    }
    const point = new window.BMap.Point(that.lng, that.lat);
    that.marker = new window.BMap.Marker(point);
    that.marker.enableDragging();
    function setPoint(ev: any) {
      that.lng = ev.point.lng;
      that.lat = ev.point.lat;
      that.pointInMap();
    }
    // 标注拖拽后的位置
    that.marker.removeEventListener("dragend", setPoint);
    that.marker.addEventListener("dragend", setPoint);
    setTimeout(() => {
      that.map.centerAndZoom(point, 15);
    }, 500);
    const geoc = new window.BMap.Geocoder();
    const circle = new window.BMap.Circle(point, that.subradius, that.styleOptions);
    geoc.getLocation(point, (rs: any) => {
      const addComp = rs.addressComponents;
      const _addr = (addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
      that.desc = _addr;
      const _label = new window.BMap.Label(_addr, {
        offset: new window.BMap.Size(20, -10)
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
  };


  public changeRadius = (event: any) => {
    const that = this;
    that.subradius = event.target.value;
    that.setState({
      radius: event.target.value
    });
    if (that.lng && that.lat) {
      this.remark(that.lng, that.lat, that.subradius);
    }
  };

  // 搜索城市
  public searchCity = (data: string) => {
    if (!data) {
      message.error('请输入内容');
    } else {
      const loc = data;
      const { akNums } = this.state;
      window.API.request({
        url: `http://api.map.baidu.com/geocoder/v2/?address=` + loc + `&output=json&ak=` + akNums + `&callback=showLocation`,
        method: 'post',
      }).then((data: any) => {
        const result = data.result;
        if (result.resultCode) {
          message.error(result.resultMessage)
        } else {
          const centerPosition = data.result.location;
          this.setState({
            centerPosition,
            change: !this.state.change
          });
        }
      }).catch((err: any) => {
        message.error(err.message)
      })
    }
  };

  // 设置城市
  public remarkCity = () => {
    const that = this;
    const myCity = new window.BMap.LocalCity();
    that.map.clearOverlays();
    myCity.get((result: any) => {
      const cityName = result.name;
      that.map.setCenter(cityName);
      setTimeout(() => {
        that.map.centerAndZoom(cityName, 15);
      }, 500)
    });
  };

  public handleSetFence = () => {
    this.props.close()
  };

  public render() {
    const { visible, title, width, form: { getFieldDecorator }, circle, type } = this.props;
    const { centerPosition } = this.state;
    const modalProps: ModalProps = {
      title,
      width,
      visible,
      onOk: this.handleSetFence,
      onCancel: this.props.close,
    };
    // 判断是为展示
    type === 'show' ? modalProps.footer = null : null;
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
          type !== 'show' ? 
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
                      enterButton={true}
                    />
                  )}
                </FormItem>
              </Col>
            </Form>
          </Row> : null
        }
        <Map ref="map" {...mapProps} />
      </Modal>
    )
  }
}

export default Form.create()(SiruiMap)