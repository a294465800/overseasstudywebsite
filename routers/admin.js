/**
 * Created by SHINING on 2017/3/19.
 */
/*
* 后台路由
* */

var express = require('express'),
    router = express.Router();

router.use(function (req, res, next) {
    if(!req.userInfo.isAdmin){
        //如果当前用户是非管理员
        res.send('对不起，只有管理员才可以进入后台管理');
        return ;  //return不能省，因为要阻止后面的next进行,next应该就是退出路由执行下面的路由的意思
    }
    //这里的next不能省
    next();
});

router.get('/',function (req, res) {
    res.render('admin/index',{
        userInfo: req.userInfo
    });
});


//返回出去给app.js
module.exports = router;