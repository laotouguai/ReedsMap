/**
 * Created by LaoTouGuai on 2017-06-13.
 * Status router
 */

const express = require('express');
const mongoose = require('mongoose');
const Status = mongoose.model("Status");
const router = express.Router();

/**
 * 发表新状态
 */
router.post('/new_status', function (req, res, next) {
    console.info("/new_status requested.");
    var body = req.body;
    var result = create(body);
    res.send(JSON.stringify({
        result: result
    }));
});

/**
 * 获取所有状态
 */
router.get('/all', function (req, res, next) {
    console.info("/all requested.");
    findAll(function (err, doc) {
        if (!err) {
            res.send(JSON.stringify(doc));
        } else {
            res.send("[]");
        }
    });
});

/**
 * 存入新Status
 * @param body body
 * @returns {boolean} 操作是否成功
 */
function create(body) {
    try {
        const status = new Status(body);
        status.createDate = new Date();
        status.save();
        return true;
    } catch (err) {
        console.error(err.message);
        return false;
    }
}

/**
 * 查询所有Status
 * @param callback
 */
function findAll(callback) {
    Status.find({}, function (err, docs) {
        callback(err, docs);
    });
}

module.exports = router;
