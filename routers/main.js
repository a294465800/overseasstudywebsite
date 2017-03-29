/**
 * Created by SHINING on 2017/3/19.
 */
/*
* 前台路由
* */

var express = require('express'),
    router = express.Router(),
    Navigation = require('../models/Navigation'),
    Nav_title = require('../models/Nav_title'),
    data,
    a;

/*
* 处理通用数据，用于前台展示的数据
* */
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
        navigations: [],
        nav_titles: []
    };

    Navigation.find().sort({Nav_order:1}).then(function (rs) {
        return data.navigations = rs;
    }).then(function () {
        Nav_title.find().populate('navigation').sort({navigation:1,Nav_title_order:1}).then(function (rs) {
            return data.nav_titles = rs;
        }).then(function () {
            next();
        });
    });
});

router.get('/',function (req, res) {
    res.render('main/index',data);
});

//返回出去给app.js
module.exports = router;