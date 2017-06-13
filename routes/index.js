var express = require('express');
var router = express.Router();

/**
 * 地图页
 */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Reeds Map'});
});

/**
 * poi列表popup
 * @param address 逆地理编码结果或其中poi
 */
router.get('/pop/poi/:address', function (req, res, next) {
    var address = JSON.parse(req.params.address);
    console.info(address);
    res.render('pop_poi', {address: address});
});

/**
 * 发表新状态popup
 * @param title 标题，位置名称
 * @param address 地址
 * @param location 位置
 */
router.get('/pop/new_status/:title/:address/:location', function (req, res, next) {
    var title = req.params.title;
    var address = req.params.address;
    var location = req.params.location;
    console.info(title + "\n" + address + "\n" + location);
    res.render('pop_new_status', {title: title, address: address, location: location});
});

module.exports = router;
