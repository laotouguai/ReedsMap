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
    "esri/symbols/SimpleMarkerSymbol",
], function (Map,
             Graphic,
             SceneView,
             MapView,
             TileLayer,
             GraphicsLayer,
             Locate,
             Point,
             SimpleMarkerSymbol) {

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
    var gLayer = new GraphicsLayer();
    map.add(gLayer);

    view.then(function () {
        // 定位并显示
        getLocation();
    });

    // 定位
    function getLocation() {
        // 原生
        // locateH5(function (result) {
        //    showLocation(result);
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
        // 百度浏览器
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function (result) {
            if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                console.info("bdh5 position:");
                console.dir(result);
                var pt = new Point({
                    latitude: result.point.lat,
                    longitude: result.point.lng
                });
                showLocation(pt);
            } else {
                console.error("bd location failed: " + this.getStatus());
            }
        }, {enableHighAccuracy: true});
    }
    
    // 原生定位
    function locateH5(callback) {
        if (window.navigator.geolocation) {
            var options = {
                enableHighAccuracy: true
            };
            window.navigator.geolocation.getCurrentPosition(success, error, options);
        } else {
            console.debug("location not support");
        }
        function success(position) {
            console.info("h5 position:");
            console.dir(position);
            var pt = new Point({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                spatialReference: view.spatialReference
            });
            callback(pt);
        }
        function error(error) {
            console.error(error);
        }
    }

    // 地图显示位置
    function showLocation(point) {
        // var transPt = point;
        // var transPt = webMercatorUtils.geographicToWebMercator(point);
        // var trans = wgs84togcj02(point.longitude, point.latitude);
        var trans = bd09togcj02(point.longitude, point.latitude);
        var transPt = new Point({
            latitude: trans[1],
            longitude: trans[0]
        });
        var locSymbol = new SimpleMarkerSymbol({
            style: "circle",
            color: "blue",
            size: "10px",
            outline: {
                color: [255,255,0],
                width: 3
            }
        });
        var locGraphic = new Graphic({
            geometry: transPt,
            symbol: locSymbol
        });
        gLayer.add(locGraphic);
        view.goTo({
            target: transPt,
            zoom: 18
        });
    }
});