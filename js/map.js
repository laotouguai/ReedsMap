/**
 * Created by LaoTouGuai on 2017-05-18.
 * Map Display
 */
require([
    "esri/Map",
    "esri/Graphic",
    "esri/views/SceneView",
    "esri/views/MapView",
    "esri/layers/TileLayer",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Locate",
    "esri/geometry/Point",
    "esri/geometry/Circle",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "dojo/domReady!"
], function (Map,
             Graphic,
             SceneView,
             MapView,
             TileLayer,
             GraphicsLayer,
             Locate,
             Point,
             Circle,
             PictureMarkerSymbol,
             SimpleFillSymbol) {

    var map = new Map();
    // var view = new SceneView({
    //     container: "viewDiv",
    //     map: map
    // });
    var view = new MapView({
        container: "viewDiv",
        map: map
    });
    var locateWidget = new Locate({
        view: view
    });
    view.ui.add(locateWidget, "top-left");
    var baseLayer = new TileLayer({
        url: "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"    // gcj02
        // url: "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
    });
    map.add(baseLayer);
    var locLayer = new GraphicsLayer();
    map.add(locLayer);

    view.then(function () {
        // 定位并显示
        initLocation();
        // 初始化事件
        initEvents();
    });

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
            var trans = bd09togcj02(point.longitude, point.latitude);
            var transPt = new Point({
                latitude: trans[1],
                longitude: trans[0]
            });
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
     * 显示位置到地图
     * @param point 点
     * @param accuracy 定位精度
     * @param attributes 定位点属性
     */
    function showLocation(point, accuracy, attributes) {
        locLayer.removeAll();
        var locSymbol = new PictureMarkerSymbol({
            url: "./assets/images/gps_marker.png",
            width: 14,
            height: 14
        });
        var locGraphic = new Graphic({
            geometry: point,
            symbol: locSymbol,
            attributes: attributes
        });
        locLayer.add(locGraphic);
        if (accuracy) { // 添加精度圈
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
            locLayer.add(waveGraphic);
        }
        view.goTo({
            target: point,
            zoom: 18
        });
    }

    /**
     * 初始化地图事件
     */
    function initEvents() {
        // 指针悬浮
        view.on("click", function (event) {
            var screenPt = {
                x: event.x,
                y: event.y
            };
            view.hitTest(screenPt).then(function (response) {
                if (response.results[0] && response.results[0].graphic) {
                    view.popup.open({
                        title: "当前位置",
                        location: response.results[0].mapPoint
                    });
                }
            });
        });
    }
});