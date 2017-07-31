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
 * @param address 逆地理编码结果
 * @param whichPoi 第几个poi，-1为显示当前地址
 */
router.get('/pop/poi/:address/:whichPoi', function (req, res, next) {
    var address = JSON.parse(req.params.address);
    var whichPoi = req.params.whichPoi;
    var addressStr = whichPoi == -1? address.address : address.surroundingPois[whichPoi].address;
    console.dir(address);
    console.info(whichPoi + "\n" + addressStr);
    res.render('pop_poi', {address: address, whichPoi: whichPoi, addressStr: addressStr});
});

/**
 * 发表新状态popup
 * @param title 标题，位置名称
 * @param address 逆地理编码结果
 * @param whichPoi 第几个poi，-1为显示当前地址
 * @param location 位置
 */
router.get('/pop/new_status/:title/:address/:whichPoi/:location', function (req, res, next) {
    var title = req.params.title;
    var address = JSON.parse(req.params.address);
    var whichPoi = req.params.whichPoi;
    var location = req.params.location;
    var addressStr = whichPoi == -1? address.address : address.surroundingPois[whichPoi].address;
    console.dir(address);
    console.info(title + "\n" + "\n" + whichPoi + "\n" + location + "\n" + addressStr);
    res.render('pop_new_status', {
        title: title,
        address: address,
        whichPoi: whichPoi,
        location: location,
        addressStr: addressStr
    });
});

module.exports = router;
