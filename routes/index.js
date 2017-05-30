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
 */
router.get('/pop_poi/:address', function (req, res, next) {
    var address = JSON.parse(req.params.address);
    console.info(address);
    res.render('pop_poi', {address: address});
});

module.exports = router;
