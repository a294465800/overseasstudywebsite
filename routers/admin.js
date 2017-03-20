/**
 * Created by SHINING on 2017/3/19.
 */
/*
* 后台路由
* */

var express = require('express'),
    router = express.Router();

router.get('/',function (req, res) {
    res.render('admin/index');
});


//返回出去给app.js
module.exports = router;