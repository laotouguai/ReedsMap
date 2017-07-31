var App = {};

require([
    "app/map"
], function (map) {
    map.init();

    App.showPoiPopup = function (address, whichPoi) {
        map.showPoiPopup(address, whichPoi);
    };

    App.newStatus = function (status) {
        $.ajax({
            url: '/status/new_status',
            type: 'POST',
            data: status,
            dataType: 'json',
            success: function (data) {
                if (data.result) {
                    $.toast('发表成功');
                    map.hidePopup();
                } else {
                    onError();
                }
            },
            error: onError
        });

        function onError() {
            console.error('post new status failed.');
            $.toast('发表失败');
        }
    };

    App.allStatuses = function (callback) {
        $.ajax({
            url: '/status/all',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                callback(data);
            },
            error: function () {
                console.error('get all status failed.');
            }
        })
    }
});
