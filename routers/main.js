/**
 * Created by SHINING on 2017/3/19.
 */
/*
* 前台路由
* */

var express = require('express'),
    router = express.Router(),
    Navigation = require('../models/Navigation');

router.get('/',function (req, res) {
    Navigation.find().sort({Nav_order:1}).then(function (rs) {
        res.render('main/index',{
            //传入数据给模版
            userInfo: req.userInfo,
            navigations: rs
        });
    });
});

//返回出去给app.js
module.exports = router;