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
    Nav_content = require('../models/Nav_content'),
    Area = require('../models/Area'),
    School = require('../models/School'),
    data;

/*
* 处理通用数据，用于前台展示的数据
* */
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo
    };

    next();
});

/*
* 首页
* */
router.get('/',function (req, res) {
    res.render('main/index',data);
});

/*
* 首页学校搜索
* */
router.post('/',function (req, res) {
    res.render('main/school_index',data);
});

/*
* 全部学校
* */
router.get('/school',function (req, res) {

    School.find().populate('area').sort({School_rank:1}).then(function (schools) {
        data.schools = schools;
        res.render('main/school_index',data);
    });
});

//返回出去给app.js
module.exports = router;