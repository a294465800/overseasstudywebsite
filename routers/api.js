/**
 * Created by SHINING on 2017/3/19.
 */
/*
* ajax接口路由
* */

var express = require('express'),
    router = express.Router();

//数据库
var User = require('../models/User'),
    Navigation = require('../models/Navigation'),
    Nav_title = require('../models/Nav_title'),
    Nav_content = require('../models/Nav_content'),
    Abroad = require('../models/Abroad'),
    Abroad_nav = require('../models/Abroad_nav'),
    Abroad_content = require('../models/Abroad_content'),
    School = require('../models/School'),
    Test = require('../models/Test'),
    Training = require('../models/Training'),
    Training_content = require('../models/Training_content');

//返回统一格式
var responseData;

//定下初始格式
router.use(function (req, res, next) {
    responseData = {
        code: 0,
        message: ''
    };
    next();
});


/*
* 用户注册
*   注册逻辑
*
*   1.用户名不能为空
*   2.密码不能为空
*   3.两次输入密码必须一致
*
*   2.用户名是否已经被注册
* */
router.post('/user/register',function (req, res) {

    var username = req.body.username,
        password = req.body.password;

    new User({
        username: username,
        password: password
    }).save().then(function (rs) {
    responseData.message = '注册成功';
    res.json(responseData);
});

});

/*
* 实时检测帐号的正确性
* */
router.post('/user/register/namecheck',function (req, res) {
    var username = req.body.username,
        news = req.body.news;

    if(news == '1'){
        responseData.code = 2;
        responseData.message = '手机号码或者邮箱不正确！';
        res.json(responseData);
    }else if(news == '2'){
        responseData.code = 4;
        responseData.message = '请填写手机号码或者邮箱';
        res.json(responseData);
    }else{
        User.findOne({
            username: username   //返回的是一个promise对象
        }).then(function (userInfo) {
            //表示数据库有该记录
            if (userInfo) {
                responseData.code = 1;
                responseData.message = '用户名已经被注册';
                res.json(responseData);
            }else{
                responseData.code = 3;
                responseData.message = '用户名可用';
                res.json(responseData);
            }
        });
    }
});

/*
* 实时验证密码的正确性
* */
router.post('/user/register/passwordcheck',function (req, res) {
    var password = req.body.password,
        news2 = req.body.news2;

    if(news2 == '1'){
        responseData.code = 5;
        responseData.message = '密码位数请控制在6~16个字符！';
        res.json(responseData);
    }else if(news2 == '0'){
        responseData.code = 6;
        responseData.message = '密码可用';
        res.json(responseData);
    }else{
        responseData.code = 7;
        responseData.message = '密码6~16个字符，区分大小写';
        res.json(responseData);
    }
});

/*
* 实时验证二次密码的正确性
* */
router.post('/user/register/repasswordcheck',function (req, res) {
    var news3 = req.body.news3;

    if(news3 == '1'){
        responseData.code = 8;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
    }else if(news3 == '0'){
        responseData.code = 9;
        responseData.message = '密码正确';
        res.json(responseData);
    }else{
        responseData.code = 10;
        responseData.message = '请再次填写密码';
        res.json(responseData);
    }
});

/*
* 登录模块的操作
* */
router.post('/user/login',function (req, res) {
    var username = req.body.username,
        password = req.body.password;

    if(username == '' || password == ''){
        responseData.code = 11;
        responseData.message = '用户名或者密码不能为空！';
        res.json(responseData);
    }else{
        User.findOne({
            username: username
        }).then(function (rs) {
            if(!rs){
                responseData.code = 12;
                responseData.message = '用户名不存在！';
                res.json(responseData);
                return Promise.reject();
            }else{
                User.findOne({
                    username: rs.username,
                    password: password
                }).then(function (rs) {
                    if(!rs){
                        responseData.code = 13;
                        responseData.message = '密码不正确！';
                        res.json(responseData);
                        return Promise.reject();
                    }
                    responseData.code = 14;
                    responseData.message = '登录成功！';
                    responseData.userInfo = {
                        id: rs._id,
                        username: rs.username
                    };
                    //发送一个信息到浏览器,通过头信息的方式发送给服务端
                    req.cookies.set('userInfo',JSON.stringify({  //保存成字符串，存在userInfo里面
                        id: rs._id,
                        username: rs.username
                    }));
                    res.json(responseData);

                });
            }

        })
    }
});

/*
 * 退出
 * */
router.get('/user/logout',function (req, res) {
    req.cookies.set('userInfo', null);
    res.json(responseData);
});

/*
* 导航标题内容二级联动菜单
* */
router.post('/navigation/title/content/add',function (req, res) {
    var navigation = req.body.navigation;
    if(navigation == ''){
    }else{
        Nav_title.find({
            navigation: navigation
        }).sort({Nav_title_order:1}).then(function (rs) {
            responseData.nav_titles = rs;
            res.json(responseData);
        })
    }
});

/*
* 导航标题内容修改二级联动菜单      （经验证，该菜单不需要设置！多余！）
* */
router.post('/navigation/title/content/edit',function (req, res) {
    var navigation = req.body.navigation,
        id = req.headers.referer,
        re = /.*id=([^&]*).*/;
        id = id.replace(re,"$1");

    if(navigation == ''){
    }else{
        Nav_title.find({
            navigation: navigation
        }).populate('navigation').sort({Nav_title_order:1}).then(function (rs) {
            responseData.nav_titles = rs;
        }).then(function () {
            Nav_content.findOne({
                _id: id
            }).populate('nav_title').then(function (nav_content) {
                responseData.nav_content = nav_content;
                res.json(responseData);
            });
        });
    }
});

/*
* 留学文章标题添加、修改二级联动菜单
* */
router.post('/study_abroad/nav/content/add',function (req, res) {
    var abroad = req.body.abroad;
    if(abroad == ''){
    }else{
        Abroad_nav.find({
            abroad: abroad
        }).populate('abroad').sort({Abroad_nav_order:1}).then(function (rs) {
            responseData.abroad_navs = rs;
            res.json(responseData);
        });
    }
});

/*
* 留学文章标题添加、修改二级联动菜单
* */
router.post('/training/content/add',function (req, res) {
    var test = req.body.test;
    if(test === ''){
    }else{
        Training.find({test: test}).populate('test').sort({Training_content_order:1}).then(function (rs) {
            responseData.trainings = rs;
            res.json(responseData);
        })
    }
});

/*
* 学校点赞
* */
router.post('/school',function (req, res) {
    var school_id = req.body.school;
    if(school_id){
        School.findById(school_id).then(function (rs) {
            var temp = rs.School_love + 1;
            School.update({
                _id: school_id
            },{
                School_love: temp
            }).then(function (rs) {
                responseData.ok = rs.ok;
                responseData.love = temp;
                res.json(responseData);
            });
        });
    }
});

/*
* 文章阅读数统计
* */
router.post('/Abroad_article',function (req, res) {
    var article_id = req.body.article;
    if(article_id){
	    Abroad_content.findById(article_id).then(function (rs) {
            var temp = rs.Abroad_content_hot + 1;
            Abroad_content.update({
                _id: article_id
            },{
	            Abroad_content_hot: temp
            }).then(function () {
                console.log(temp);
                res.json(responseData);
            })
	    })
    }
});

//返回出去给app.js
module.exports = router;