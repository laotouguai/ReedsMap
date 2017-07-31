/**
 * Created by LaoTouGuai on 2017-05-18.
 * Map Display
 */
define([
    "esri/Map",
    "esri/Graphic",
    "esri/views/MapView",
    "esri/layers/TileLayer",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Locate",
    "esri/geometry/Point",
    "esri/geometry/Circle",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "app/transform",
    "dojo/domReady!"
], function (Map,
             Graphic,
             MapView,
             TileLayer,
             GraphicsLayer,
             Locate,
             Point,
             Circle,
             PictureMarkerSymbol,
             SimpleFillSymbol,
             Trans) {

    var _map;
    var _view;
    var _locLayer;      // 定位点GraphicsLayer
    var _statusLayer;   // 状态点GraphicsLayer
    var _zoomAction;    // Poopup默认缩放Action

    /**
     * 初始化
     */
    function init() {
        _map = new Map();
        _view = new MapView({
            container: "viewDiv",
            map: _map
        });
        var locateWidget = new Locate({
            view: _view
        });
        _view.ui.add(locateWidget, "top-left");
        var baseLayer = new TileLayer({
            url: "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"    // gcj02
        });
        _map.add(baseLayer);
        _locLayer = new GraphicsLayer();
        _map.add(_locLayer);
        _statusLayer = new GraphicsLayer();
        _map.add(_statusLayer);

        _view.then(function () {
            // 定位并显示
            initLocation();
            // 初始化事件
            initEvents();
            _zoomAction = _view.popup.actions.getItemAt(0);
            drawAllStatuses();
        });
    }

    /**
     * 初始化定位并显示到地图
     */
    function initLocation() {
        // 原生
        // locateH5(function (result) {
        //     var point = new Point({
        //         latitude: result.coords.latitude,
        //         longitude: result.coords.longitude,
        //     });
        //     var trans = wgs84togcj02(point.longitude, point.latitude);
        //     var transPt = new Point({
        //         latitude: trans[1],
        //         longitude: trans[0]
        //     });
        //    showLocation(transPt);
        // });
        // Arcgis
        // locateWidget.locate().then(function (position) {
        //     console.dir(position);
        // });
        // 百度IP
        // var city = new BMap.LocalCity();
        // city.get(function (result) {
        //     console.info("bdip position:");
        //     console.dir(result);
        // });
        // 百度
        locateBD(function (result) {
            var point = new Point({
                latitude: result.point.lat,
                longitude: result.point.lng
            });
            var trans = Trans.bd09togcj02(point.longitude, point.latitude);
            var transPt = new Point({
                latitude: trans[1],
                longitude: trans[0]
            });
            console.info("transpt:");
            console.dir(transPt);
            showLocation(transPt, result.accuracy, result.address);
        });
    }

    /**
     * 原生定位
     * @param callback 定位结果回调
     */
    function locateH5(callback) {
        if (window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition(function (position) {
                console.info("h5 position:");
                console.dir(position);
                callback(position);
            }, function (error) {
                console.error("location failed:" +error);
            }, {enableHighAccuracy: true});
        } else {
            console.debug("location not support");
        }
    }

    /**
     * 百度定位
     * @param callback 定位结果回调
     */
    function locateBD(callback) {
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function (result) {
            if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                console.info("bdh5 position:");
                console.dir(result);
                callback(result);
            } else {
                console.error("bd location failed: " + this.getStatus());
            }
        }, {enableHighAccuracy: true});
    }

    /**
     * 百度逆地理编码
     * @param point bd09坐标，ArcGIS Point
     * @param callback 回调
     */
    function reverseGeocode(point, callback) {
        var geoc = new BMap.Geocoder();
        var pt = new BMap.Point();
        pt.lat = point.latitude;
        pt.lng = point.longitude;
        geoc.getLocation(pt, function (result) {
            if (result) {
                console.info("reverse geocode result:");
                console.dir(result);
                callback(result);
            } else {
                console.info("reverse geocode no result!");
            }
        });
    }

    /**
     * 显示位置到地图
     * @param point 点 ArcGIS Point
     * @param accuracy 定位精度
     * @param attributes 定位点属性
     */
    function showLocation(point, accuracy, attributes) {
        // _locLayer.removeAll();
        // 定位图标
        var locSymbol = new PictureMarkerSymbol({
            url: "/images/gps_marker.png",
            width: 14,
            height: 14
        });
        var locGraphic = new Graphic({
            geometry: point,
            symbol: locSymbol,
            attributes: attributes
        });
        _locLayer.add(locGraphic);
        // 精度圈
        accuracy = accuracy || 1000;    // 默认显示1000
        var waveSymbol = new SimpleFillSymbol({
            color: [97, 160, 191, 0.05],
            style: "solid",
            outline: {
                color: [27, 182, 255, 0.48],
                width: 1
            }
        });
        var waveCircle = new Circle({
            center: point,
            radius: accuracy,
            geodesic: true      // 避免变形
        });
        var waveGraphic = new Graphic({
            geometry: waveCircle,
            symbol: waveSymbol
        });
        _locLayer.add(waveGraphic);
        _view.goTo({
            target: point,
            zoom: 18
        });
    }

    /**
     * 初始化地图事件
     */
    function initEvents() {
        // 指针点击
        _view.on("click", function (event) {
            if (_view.popup.visible && !_view.popup.dockEnabled) {
                _view.popup.close();    // 非dock状态再次点击则隐藏
                return;
            }
            var screenPt = {
                x: event.x,
                y: event.y
            };
            var pt = _view.toMap(screenPt);
            var trans = Trans.gcj02tobd09(pt.longitude, pt.latitude);
            var transPt = {
                latitude: trans[1],
                longitude: trans[0]
            };
            // 逆地理编码，显示popup
            reverseGeocode(transPt, function (result) {
                showPoiPopup(result, -1, pt);
            });
        });
    }

    /**
     * 显示Poi列表Popup
     * @param  address 逆地理编码结果
     * @param  whichPoi 显示第几个poi，-1为显示当前地址
     * @param  point  Popup显示点，为空则使用address中坐标点
     */
    function showPoiPopup(address, whichPoi, point) {
        var title = "位置";
        var location = point;
        var url = "/pop/poi/" + $.toJSON(address) + "/" + whichPoi;
        if (whichPoi === -1) {  // 当前地址
            if (address.surroundingPois && address.surroundingPois.length !== 0) {
                // 直接显示第一个poi名称附近
                title = address.surroundingPois[0].title + "附近";
            }
        } else {    // 结果中poi
            var poi = address.surroundingPois[whichPoi];
            var trans = Trans.bd09togcj02(poi.point.lng, poi.point.lat);
            location = new Point({
                latitude: trans[1],
                longitude: trans[0]
            });
            title = poi.title;
        }

        // 初始化Actions
        var newStatusAction = {
            title: "发表状态",
            id: "new-status",
            className: "esri-icon-plus-circled"
        };
        _view.popup.clear();
        _view.popup.actions.removeAll();
        _view.popup.actions.push(_zoomAction);
        _view.popup.actions.push(newStatusAction);
        _view.popup.on("trigger-action", function (event) {
            if (event.action.id === "new-status") {
                showNewStatusPopup(title, address, whichPoi, location);
            }
        });

        // 采用iframe加载页面，逆地理编码结果通过参数传入 // 若直接将整个页面放入content，则页面中script无法执行
        _view.popup.open({   // popup
            title: title,
            content: "<iframe id='iframe' src='" +url+ "' sandbox='allow-forms allow-popups allow-scripts allow-same-origin allow-modals' scrolling='auto' frameborder='0' width='100%' height='0'></iframe>",
            location: location
        });
    }

    /**
     * 显示发表状态Popup
     * @param title 标题，位置名称
     * @param address 地址，逆地理编码结果
     * @param  whichPoi 显示第几个poi，-1为显示当前地址
     * @param location 位置
     */
    function showNewStatusPopup(title, address, whichPoi, location) {
        if (title === "位置") {
            title = address.address;
        }
        var url = "/pop/new_status/" + title + "/" + $.toJSON(address) + "/" + whichPoi+ "/" +$.toJSON(location);
        _view.popup.clear();
        _view.popup.actions.removeAll();
        _view.popup.open({
            title: title,
            content: "<iframe id='iframe' src='" +url+ "' sandbox='allow-forms allow-popups allow-scripts allow-same-origin allow-modals' scrolling='auto' frameborder='0' width='100%' height='0'></iframe>",
            location: location
        });
    }

    /**
     * 绘制所有状态点（临时）
     */
    function drawAllStatuses() {
        App.allStatuses(function (data) {
            console.dir(data);
            for (var i = 0; i < data.length; i++) {
                var status = data[i];
                var point = new Point({
                    latitude: status.location.y,
                    longitude: status.location.x
                    // spatialReference: status.location.spatialReference
                });
                console.info("draw point");
                console.dir(point);
                var statSymbol = new PictureMarkerSymbol({
                    url: "/images/marker_shadow.png",
                    width: 50,
                    height: 32,
                    yoffset: 12
                });
                var statGraphic = new Graphic({
                    geometry: point,
                    symbol: statSymbol
                });
                _statusLayer.add(statGraphic);
            }
        });
    }

    /**
     * 隐藏Popup
     */
    function hidePopup() {
        _view.popup.close();
    }

    return {
        init: init,
        showPoiPopup: showPoiPopup,
        hidePopup: hidePopup
    };
});
