/**
 * Created by SHINING on 2017/3/19.
 */
/*
* 后台路由
* */

var express = require('express'),
    router = express.Router(),
    User = require('../models/User'),
    Navigation = require('../models/Navigation'),
    Nav_title = require('../models/Nav_title');

/*
* 首页
* */
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


/*
* 用户管理
* */
router.get('/user',function (req, res) {

    /*
     * 从数据库当中读取所有的用户数据
     *
     * limit(Number)：限制获取的数据条数
     * skip(Number):忽略数据的条数
     *
     * 每页显示2条
     * 1：1-2 skip(0); ->(当前页-1) * limit
     * 2: 3-4 skip(2);
     * */

    var page = Number(req.query.page || 1),   //在实际开发可能还要对page进行判断，是否为数字之类
        limit = 10,
        pages = 0;

    //获取数据库中的条数
    User.count().then(function (count) {

        //计算总页数
        pages = Math.ceil(count / limit);

        //取值不能超过pages
        page = Math.min(page, pages);

        //取值不能小于1
        page = Math.max(page, 1);

        var skip = (page - 1) * limit;

        /*
         * 从数据库中读取所有用户数据
         * */
        User.find().sort({_id:-1}).limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                count: count,
                pages: pages,
                limit: limit,
                page: page,
                forPage: 'user'
            });
        });
    });
});

/*
* 用户添加
* */
router.get('/user/add',function (req, res) {
    res.render('admin/user_add',{
        userInfo: req.userInfo
    });
});

/*
* 用户添加保存
* */
router.post('/user/add',function (req, res) {
    var username = req.body.username || '',
        password = req.body.password || '',
        isAdmin = req.body.isAdmin || false;
    if(username == '' || password == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message: '用户名称或者密码不能为空！'
        });
        return ;
    }

    //判断是否有相同名字的用户
    User.findOne({
        username: username
    }).then(function (rs) {
        if(rs){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '用户已经存在！'
            });
            return Promise.reject();
        }else{
            //数据库不存在该用户，可以保存
            return new User({
                username: username,
                password: password,
                isAdmin: isAdmin
            }).save();
        }
    }).then(function (rs) {
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '用户保存成功！',
            url: '/admin/user'
        });
    });
});

/*
* 用户修改
* */
router.get('/user/edit',function (req, res) {

    //获取要修改的用户的信息，并且用表单的形式展现出来
    var id = req.query.id || '';

    //获取要修改的用户id
    User.findOne({
        _id: id
    }).then(function (rs) {
        if(!rs){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '用户信息不存在！'
            });
            return Promise.reject();
        }else{
            res.render('admin/user_edit',{
                userInfo: req.userInfo,
                user: rs
            });
        }
    })
});

/*
* 用户修改保存
* */
router.post('/user/edit',function (req, res) {

    var id = req.query.id || '',

        //获取post提交过来的名称
        username = req.body.username || '',
        password = req.body.password || '',
        isAdmin = req.body.isAdmin || false;

    if(username == '' || password == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '用户名称或者密码不能为空！'
        });
        return ;
    }

    User.findOne({
        _id: id
    }).then(function (rs) {
        if(!rs){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '用户信息不存在！'
            });
            return Promise.reject();
        }else{
            //当用户没有修改名称和密码提交的时候
            if(username == rs.username && password == rs.password){
                User.update({
                    _id: id
                },{
                    username: username,
                    password: password,
                    isAdmin: isAdmin
                }).then(function () {
                    res.render('admin/success',{
                        userInfo: req.userInfo,
                        message: '用户信息修改成功！',
                        url: '/admin/user'
                    });
                });
                return Promise.reject();
            }else {
                //要修改的导航名称是否存在
                return User.findOne({
                    _id: {$ne: id},
                    username: username
                });
            }
        }
    }).then(function (sameNavigation) {
        if(sameNavigation){
            console.log('1');
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '数据库中已经存在同名用户！'
            });
            return Promise.reject();
        }else{
            return User.update({
                _id: id
            },{
                username: username,
                password: password,
                isAdmin: isAdmin
            });
        }
    }).then(function (rs) {
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '用户信息修改成功！',
            url: '/admin/user'
        });
    });
});

/*
* 用户删除
* */
router.get('/user/delete',function (req, res) {
    //获取要删除的分类的id
    var id = req.query.id || '';

    User.remove({
        _id: id
    }).then(function () {
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '删除成功!',
            url: '/admin/user'
        });
    });
});


/*
* 导航管理首页
* */
router.get('/navigation',function (req, res) {
    Navigation.find().sort({Nav_order:1}).then(function (navigations) {
        res.render('admin/navigation_index', {
            userInfo: req.userInfo,
            navigations: navigations
        });
    });
});

/*
* 导航添加
* */
router.get('/navigation/add',function (req, res) {
    res.render('admin/navigation_add',{
        userInfo: req.userInfo
    });
});

/*
* 导航添加的保存
* */
router.post('/navigation/add',function (req, res) {
    var Nav_name = req.body.Nav_name || '',
        Nav_order = Number(req.body.Nav_order),
        Nav_url = req.body.Nav_url || '/';
    if(Nav_name == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message: '导航名称不能为空！'
        });
    }

    //判断是否有相同名字的导航
    Navigation.findOne({
        Nav_name:Nav_name
    }).then(function (rs) {
        if(rs){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '导航已经存在！'
            });
            return Promise.reject();
        }else{
            //数据库不存在该导航，可以保存
            return new Navigation({
                Nav_name:Nav_name,
                Nav_order:Nav_order,
                Nav_url:Nav_url
            }).save();
        }
    }).then(function (rs) {
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '导航保存成功！',
            url: '/admin/navigation'
        });
    });
});

/*
* 导航修改
* */
router.get('/navigation/edit',function (req, res) {

    //获取要修改的导航的信息，并且用表单的形式展现出来
    var id = req.query.id || '';

    //获取要修改的导航id
    Navigation.findOne({
        _id: id
    }).then(function (rs) {
        if(!rs){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '导航信息不存在！'
            });
            return Promise.reject();
        }else{
            res.render('admin/navigation_edit',{
                userInfo: req.userInfo,
                navigation: rs
            });
        }
    })
});

/*
* 导航修改保存
* */
router.post('/navigation/edit',function (req, res) {

    var id = req.query.id || '',

    //获取post提交过来的名称
        Nav_name = req.body.Nav_name || '',
        Nav_order = Number(req.body.Nav_order),
        Nav_url = req.body.Nav_url || '/';

    if(Nav_name == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '导航名称不能为空！'
        });
        return ;
    }

    Navigation.findOne({
        _id: id
    }).then(function (rs) {
        if(!rs){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '导航信息不存在！'
            });
            return Promise.reject();
        }else{
            //当用户没有修改名称提交的时候
            if(Nav_name == rs.Nav_name){
                Navigation.update({
                    _id: id
                },{
                    Nav_name: Nav_name,
                    Nav_order: Nav_order,
                    Nav_url: Nav_url
                }).then(function () {
                    res.render('admin/success',{
                        userInfo: req.userInfo,
                        message: '导航信息修改成功！',
                        url: '/admin/navigation'
                    });
                });
                return Promise.reject();
            }else {
                //要修改的导航名称是否存在
                return Navigation.findOne({
                    _id: {$ne: id},
                    Nav_name: Nav_name
                });
            }
        }
    }).then(function (sameNavigation) {
        if(sameNavigation){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '数据库中已经存在同名导航！'
            });
            return Promise.reject();
        }else{
            return Navigation.update({
                _id: id
            },{
                Nav_name: Nav_name,
                Nav_order: Nav_order,
                Nav_url: Nav_url
            });
        }
    }).then(function () {
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '导航信息修改成功！',
            url: '/admin/navigation'
        });
    });
});

/*
* 导航删除
* */
router.get('/navigation/delete',function (req, res) {
    //获取要删除的分类的id
    var id = req.query.id || '';

    Navigation.remove({
        _id: id
    }).then(function () {
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '删除成功!',
            url: '/admin/navigation'
        });
    });
});

/*
* 导航内容列表
* */
router.get('/navigation/title',function (req, res) {

    var page = Number(req.query.page || 1),   //在实际开发可能还要对page进行判断，是否为数字之类
        limit = 10,
        pages = 0;

    //获取数据库中的条数
    Nav_title.count().then(function (count) {

        //计算总页数
        pages = Math.ceil(count / limit);

        //取值不能超过pages
        page = Math.min(page, pages);

        //取值不能小于1
        page = Math.max(page, 1);

        var skip = (page - 1) * limit;

        /*
         * 从数据库中读取所有用户数据
         * */
        Nav_title.find().sort({navigation:1}).limit(limit).skip(skip).populate('navigation').then(function (Nav_titles) {

            res.render('admin/navigation_title', {
                userInfo: req.userInfo,
                Nav_titles: Nav_titles,
                count: count,
                pages: pages,
                limit: limit,
                page: page,
                forPage: 'navigation/title'
            });
        });
    });
});

/*
* 导航内容标题添加页面
* */
router.get('/navigation/title/add',function (req, res) {

    Navigation.find().sort({Nav_order:1}).then(function (navigations) {
        res.render('admin/navigation_title_add',{
            userInfo: req.userInfo,
            navigations:navigations
        });
    });
});

/*
* 导航内容标题保存页面
* */
router.post('/navigation/title/add',function (req, res) {

    console.log(req.body);
    if(req.body.navigation == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '导航分类不能为空！'
        });
        return ;
    }
    if(req.body.Nav_title == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '导航内容标题不能为空！'
        });
        return ;
    }

    //保存
    new Nav_title({
        navigation: req.body.navigation,
        Nav_title: req.body.Nav_title
    }).save().then(function (rs) {
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '导航内容标题保存成功！',
            url: '/admin/navigation/title'
        });
    });
});


/*
* 修改导航内容标题
* */
router.get('/navigation/title/edit',function (req, res) {
    var id = req.query.id || '',
        navigations = [];

    Navigation.find().sort({Nav_order:1}).then(function (rs) {

        navigations = rs;

        return Nav_title.findOne({
            _id:id
        }).populate('navigation');
    }).then(function (nav_title) {
        if(!nav_title){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '导航内容标题不存在！'
            });
            return Promise.reject();
        }else {
            res.render('admin/navigation_title_edit',{
                userInfo: req.userInfo,
                navigations: navigations,
                nav_title: nav_title
            });
        }
    });
});

/*
* 修改导航内容标题保存
* */
router.post('/navigation/title/edit',function (req, res) {
    var id = req.query.id || '',
        title = req.body.Nav_title || '';

    // console.log(req.body);

    Nav_title.findOne({
        _id: id
    }).populate('navigation').then(function (rs) {
        if (req.body.navigation == '') {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '导航名称不能为空！'
            });
            return Promise.reject();
        } else if (title == '') {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '内容标题不能为空！'
            });
            return Promise.reject();
        } else {
            return Nav_title.findOne({
                navigation:  req.body.navigation,
                _id: {$ne:id},
                Nav_title: title
            });
        }
    }).then(function (sameTitle) {
        if(sameTitle){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '导航内容标题不能重复！'
            });

            return Promise.reject();
        }else{
            return Nav_title.update({
                _id: id
            },{
                navigation: req.body.navigation,
                Nav_title: title
            });
        }
    }).then(function (rs) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容修改保存成功',
            url: '/admin/navigation/title'
        });
    });
});




//返回出去给app.js
module.exports = router;