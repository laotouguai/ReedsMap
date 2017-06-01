var App = {};

require([
    "app/map"
], function (map) {
    map.init();

    App.showPoiPopup = function (poi) {
        map.showPoiPopup(poi);
    };
});
