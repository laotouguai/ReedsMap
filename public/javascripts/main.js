var App = {};

require([
    "app/map"
], function (map) {
    map.init();

    App.show = function (msg) {
        alert(msg);
    }
});
