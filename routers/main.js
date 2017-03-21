/**
 * Created by SHINING on 2017/3/19.
 */
/*
* 前台路由
* */

var express = require('express'),
    router = express.Router();

router.get('/',function (req, res) {
    res.render('main/index',{
        //传入数据给模版
        userInfo: req.userInfo
    });
});

//返回出去给app.js
module.exports = router;