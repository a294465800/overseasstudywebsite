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
    Nav_title = require('../models/Nav_title'),
    Nav_content = require('../models/Nav_content'),
    Area = require('../models/Area'),
    School = require('../models/School'),
    Abroad = require('../models/Abroad'),
    Abroad_nav = require('../models/Abroad_nav'),
    Abroad_content = require('../models/Abroad_content'),
    data;

/*
* 通用数据
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
        limit = 20,
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
            res.render('admin/user/user_index', {
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
    res.render('admin/user/user_add',{
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
            res.render('admin/user/user_edit',{
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
    }).then(function () {
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
        res.render('admin/navigation/navigation_index', {
            userInfo: req.userInfo,
            navigations: navigations
        });
    });
});

/*
* 导航添加
* */
router.get('/navigation/add',function (req, res) {
    res.render('admin/navigation/navigation_add',{
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
            res.render('admin/navigation/navigation_edit',{
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
* 导航内容标题列表
* */
router.get('/navigation/title',function (req, res) {

    var page = Number(req.query.page || 1),   //在实际开发可能还要对page进行判断，是否为数字之类
        limit = 20,
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
        Nav_title.find().sort({navigation:1,Nav_title_order:1}).limit(limit).skip(skip).populate('navigation').then(function (Nav_titles) {

            res.render('admin/navigation/navigation_title', {
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
        res.render('admin/navigation/navigation_title_add',{
            userInfo: req.userInfo,
            navigations:navigations
        });
    });
});

/*
* 导航内容标题保存页面
* */
router.post('/navigation/title/add',function (req, res) {
    var navigation = req.body.navigation || '',
        title = req.body.Nav_title || '',
        order = Number(req.body.Nav_title_order);
    if(navigation == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '导航分类不能为空！'
        });
        return ;
    }
    if(title == ''){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '导航内容标题不能为空！'
        });
        return ;
    }

    Nav_title.findOne({
        navigation: navigation,
        Nav_title: title
    }).then(function (sameTitle) {
        if(sameTitle){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '导航内容标题不能重复！'
            });
            return Promise.reject();
        }else{
            new Nav_title({
                navigation: navigation,
                Nav_title: title,
                Nav_title_order: order
            }).save().then(function () {
                Nav_title.find({
                    navigation: navigation
                }).count().then(function (rs) {
                    Navigation.update({
                        _id: navigation
                    },{
                        Nav_count: rs
                    }).then(function () {
                        res.render('admin/success',{
                            userInfo: req.userInfo,
                            message: '导航内容标题保存成功！',
                            url: '/admin/navigation/title'
                        });
                    });
                });
            })
        }
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
            res.render('admin/navigation/navigation_title_edit',{
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
        title = req.body.Nav_title || '',
        order = Number(req.body.Nav_title_order);

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
                Nav_title: title,
                Nav_title_order: order
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

/*
* 删除导航内容标题
* */
router.get('/navigation/title/delete',function (req, res) {
    //获取要删除的分类的id
    var id = req.query.id || '',
        navigation_id;

    Nav_title.findById({
        _id: id
    }).then(function (rs) {
        navigation_id = rs.navigation;
        Nav_title.remove({
            _id: id
        }).then(function () {
            Nav_title.find({
                navigation: navigation_id
            }).count().then(function (rs) {
                Navigation.update({
                    _id: navigation_id
                }, {
                    Nav_count: rs
                }).then(function () {
                    res.render('admin/success', {
                        userInfo: req.userInfo,
                        message: '删除成功!',
                        url: '/admin/navigation/title'
                    });
                });
            });
        });
    });
});

/*
* 标题内容列表
* */
router.get('/navigation/title/content',function (req, res) {

    data.page = Number(req.query.page || 1);   //在实际开发可能还要对page进行判断，是否为数字之类
    data.limit = 20;
    data.pages = 0;

    //获取数据库中的条数
    Nav_content.count().then(function (count) {

        data.count = count;
        //计算总页数
        data.pages = Math.ceil(count / data.limit);

        //取值不能超过pages
        data.page = Math.min(data.page, data.pages);

        //取值不能小于1
        data.page = Math.max(data.page, 1);

        data.skip = (data.page - 1) * data.limit;

        /*
         * 从数据库中读取所有用户数据
         * */
        Nav_content.find().populate(['navigation','nav_title']).sort({navigation:1,nav_title:1,Nav_content_order:1}).limit(data.limit).skip(data.skip).then(function (Nav_contents) {
            data.Nav_contents = Nav_contents;
            data.forPage = 'navigation/title/content';
            res.render('admin/navigation/navigation_title_content', data);
        });
    });
});

/*
* 标题内容添加
* */
router.get('/navigation/title/content/add',function (req, res) {

    Navigation.find().sort({Nav_order:1}).then(function (navigations) {
        data.navigations = navigations;
        res.render('admin/navigation/navigation_title_content_add',data);
    });
});

/*
* 标题内容添加保存
* */
router.post('/navigation/title/content/add',function (req, res) {
    var navigation = req.body.navigation || '',
        nav_title = req.body.nav_title || '',
        Nav_content_name = req.body.Nav_content_name || '',
        Nav_content_url = req.body.Nav_content_url || '/',
        Nav_content_order = Number(req.body.Nav_content_order);

    if(navigation == '' || nav_title == ''){
        data.message = '导航名称或者导航标题不能为空！';
        res.render('admin/error',data);
        return ;
    }

    if(Nav_content_name == ''){
        data.message = '标题内容不能为空！';
        res.render('admin/error',data);
        return ;
    }

    Nav_content.findOne({
        navigation: navigation,
        nav_title: nav_title,
        Nav_content_name: Nav_content_name
    }).then(function (sameName) {
        if(sameName){
            data.message = '标题内容不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            new Nav_content({
                navigation: navigation,
                nav_title: nav_title,
                Nav_content_name: Nav_content_name,
                Nav_content_order: Nav_content_order,
                Nav_content_url: Nav_content_url
            }).save().then(function () {
                Nav_content.find({
                    navigation: navigation,
                    nav_title: nav_title
                }).count().then(function (count) {
                    Nav_title.update({
                        _id: nav_title
                    },{
                        Nav_title_count: count
                    }).then(function () {
                        data.message = '标题内容保存成功！';
                        data.url = '/admin/navigation/title/content';
                        res.render('admin/success',data);
                    });
                });
            });
        }
    });
});

/*
* 标题内容修改
* */
router.get('/navigation/title/content/edit',function (req, res) {
    var id = req.query.id || '';

    Navigation.find().sort({Nav_order:1}).then(function (rs) {
        data.navigations = rs;
        return Nav_content.findOne({
            _id:id
        }).populate(['navigation','nav_title']);
    }).then(function (nav_content) {
        if(!nav_content){
            data.message = '导航内容标题不存在！';
            res.render('admin/error',data);
            return Promise.reject();
        }else {
            data.nav_content = nav_content;
            Nav_content.findById(id).populate(['navigation','nav_title']).then(function (rs) {
                Nav_title.find({
                    navigation: rs.navigation._id
                }).populate(['navigation','nav_title']).sort({Nav_title_order: 1}).then(function (rs) {
                    data.nav_titles = rs;
                    res.render('admin/navigation/navigation_title_content_edit',data);
                });
            });
        }
    });
});

/*
* 标题内容修改保存
* */
router.post('/navigation/title/content/edit',function (req, res) {
    var id = req.query.id || '',
        navigation = req.body.navigation || '',
        nav_title = req.body.nav_title || '',
        Nav_content_name = req.body.Nav_content_name,
        Nav_content_url = req.body.Nav_content_url,
        Nav_content_order = Number(req.body.Nav_content_order);

    if(navigation == '' || nav_title == ''){
        data.message = '导航或者导航标题不能为空！';
        res.render('admin/error',data);
        return ;
    }

    if(Nav_content_name == ''){
        data.message = '标题内容不能为空！';
        res.render('admin/error',data);
        return ;
    }
    Nav_content.findOne({
        _id: {$ne:id},
        navigation: navigation,
        nav_title: nav_title,
        Nav_content_name: Nav_content_name
    }).populate(['navigation','nav_title']).then(function (rs) {
        if(rs){
            data.message = '标题内容不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return Nav_content.update({
                _id: id
            },{
                navigation: navigation,
                nav_title: nav_title,
                Nav_content_name: Nav_content_name,
                Nav_content_order: Nav_content_order,
                Nav_content_url: Nav_content_url
            });
        }
    }).then(function () {
        data.message = '修改成功！';
        data.url = '/admin/navigation/title/content';
        res.render('admin/success',data);
    });
});

/*
* 标题内容删除
* */
router.get('/navigation/title/content/delete',function (req, res) {
    var id = req.query.id,
        nav_title_id;

    Nav_content.findById({
        _id: id
    }).then(function (rs) {
        nav_title_id = rs.nav_title;
        Nav_content.remove({
            _id: id
        }).then(function () {
            Nav_content.find({
                nav_title: nav_title_id
            }).count().then(function (rs) {
                Nav_title.update({
                    _id: nav_title_id
                }, {
                    Nav_title_count: rs
                }).then(function () {
                    data.message = '删除成功！';
                    data.url = '/admin/navigation/title/content';
                    res.render('admin/success',data);
                });
            });
        });
    });
});

/*
* 地区列表
* */
router.get('/area',function (req, res) {
    Area.find().sort({Area_order:1}).then(function (rs) {
        data.areas = rs;
        res.render('admin/school/school_area',data);
    });
});

/*
* 地区添加列表
* */
router.get('/area/add',function (req, res) {
    res.render('admin/school/school_area_add',data);
});

/*
* 地区添加列表保存
* */
router.post('/area/add',function (req, res) {
    var area_name = req.body.area_name,
        area_order = req.body.area_order;
    if(area_name == ''){
        data.message = '地区名称不能为空！';
        res.render('admin/error',data);
        return ;
    }
    Area.findOne({Area_name:area_name}).then(function (rs) {
        if(rs){
            data.message = '地区名称不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else {
            new Area({
                Area_name: area_name,
                Area_order: area_order
            }).save().then(function () {
                data.message = '地区保存成功!';
                data.url = '/admin/area';
                res.render('admin/success',data);
            });
        }
    });
});

/*
* 地区修改
* */
router.get('/area/edit',function (req, res) {
    var id = req.query.id || '';
    Area.findById(id).then(function (rs) {
        if(!rs){
            data.message = '所要删除的地区不存在！';
            res.render('admin/error',data);
            return Promise.reject();
        }
        data.area = rs;
        res.render('admin/school/school_area_edit',data);
    });
});

/*
* 地区修改保存
* */
router.post('/area/edit',function (req, res) {
    var area_name = req.body.area_name || '',
        area_order = Number(req.body.area_order),
        id = req.query.id || '';

    if(!area_name){
        data.message = '地区名称不能为空！';
        res.render('admin/error',data);
        return ;
    }

    Area.findOne({Area_name: area_name,_id: {$ne:id}}).then(function (rs) {
        if(rs){
            data.message = '地区名称不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return Area.update({
                _id: id
            },{
                Area_name: area_name,
                Area_order: area_order
            });
        }
    }).then(function () {
        data.message = '地区修改成功！';
        data.url = '/admin/area';
        res.render('admin/success',data);
    });
});

/*
* 地区删除
* */
router.get('/area/delete',function (req, res) {
    var id = req.query.id || '';

    if(!id){
        data.message = '所要删除的地区不存在！';
        res.render('admin/error',data);
        return ;
    }

    Area.remove({
        _id:id
    }).then(function () {
        data.message = '地区删除成功！';
        data.url = '/admin/area';
        res.render('admin/success',data);
    });
});

/*
* 学校信息列表
* */
router.get('/school',function (req, res) {

    data.page = Number(req.query.page || 1);   //在实际开发可能还要对page进行判断，是否为数字之类
    data.limit = 20;
    data.pages = 0;

    //获取数据库中的条数
    School.count().then(function (count) {

        data.count = count;
        //计算总页数
        data.pages = Math.ceil(count / data.limit);

        //取值不能超过pages
        data.page = Math.min(data.page, data.pages);

        //取值不能小于1
        data.page = Math.max(data.page, 1);

        data.skip = (data.page - 1) * data.limit;

        /*
         * 从数据库中读取所有用户数据
         * */
        School.find().populate('area').sort({School_rank:1}).limit(data.limit).skip(data.skip).then(function (schools) {
            data.schools = schools;
            data.forPage = 'school';
            res.render('admin/school/school_index', data);
        });
    });
});

/*
* 学校添加
* */
router.get('/school/add',function (req, res) {

    Area.find().sort({Area_order:1}).then(function (rs) {
        data.areas = rs;
        res.render('admin/school/school_add',data);
    });
});

/*
* 学校添加保存
* */
router.post('/school/add',function (req, res) {
    var area_name = req.body.area_name || '',
        school_zn = req.body.school_zn || '',
        school_en = req.body.school_en || '',
        school_rank = Number(req.body.school_rank),
        school_url = req.body.school_url;

    if(area_name == ''){
        data.message = '学校地区不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(school_zn == '' || school_en == ''){
        data.message = '学校名称不能为空！';
        res.render('admin/error',data);
        return ;
    }

    School.findOne({
        School_zn: school_zn
    }).then(function (rs) {
        if(rs){
            data.message = '学校中文名称不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return School.findOne({
                School_en: school_en
            });
        }
    }).then(function (rs) {
        if(rs){
            data.message = '学校英文名称不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return new School({
                area: area_name,
                School_zn: school_zn,
                School_en: school_en,
                School_rank: school_rank,
                School_url: school_url
            }).save();
        }
    }).then(function () {
        return School.find({area:area_name}).count();
    }).then(function (count) {
        return Area.update({
            _id:area_name
        },{
            Area_count: count
        });
    }).then(function (rs) {
        data.message = '学校保存成功！';
        data.url = '/admin/school';
        res.render('admin/success',data);
    });
});

/*
* 学校修改
* */
router.get('/school/edit',function (req, res) {
    var id = req.query.id || '';

    Area.find().sort({Area_order:1}).then(function (rs) {
        data.areas = rs;
    }).then(function () {
        return School.findById(id).populate('area');
    }).then(function (rs) {
        data.school = rs;
        res.render('admin/school/school_edit',data);
    });
});

/*
* 学校修改保存
* */
router.post('/school/edit',function (req, res) {
    var id = req.query.id || '',
        area_name = req.body.area_name || '',
        school_zn = req.body.school_zn || '',
        school_en = req.body.school_en || '',
        school_rank = Number(req.body.school_rank),
        school_url = req.body.school_url;

    if(area_name == ''){
        data.message = '学校地区不能为空！';
        res.render('admin/error',data);
        return ;
    }

    if(school_zn == '' || school_en == ''){
        data.message = '学校名称不能为空！';
        res.render('admin/error',data);
        return ;
    }

    School.findOne({_id: {$ne:id},School_zn: school_zn}).then(function (rs) {
        if(rs){
            data.message = '学校中文名称不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return School.findOne({_id: {$ne:id},School_en: school_en});
        }
    }).then(function (rs) {
        if(rs){
            data.message = '学校英文名称不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else {
            return School.update({
                _id: id
            },{
                area: area_name,
                School_zn: school_zn,
                School_en: school_en,
                School_rank: school_rank,
                School_url: school_url
            });
        }
    }).then(function () {
        data.message = '学校修改成功！';
        data.url = '/admin/school';
        res.render('admin/success',data);
    });
});

/*
* 学校删除
* */
router.get('/school/delete',function (req, res) {
    var id = req.query.id || '',
        area;

    School.findById(id).then(function (rs) {
        if(!rs){
            data.message = '要删除的学校不存在！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            area = rs.area;
            return School.remove({
                _id: id
            });
        }
    }).then(function () {
        return School.find({
            area: area
        }).count();
    }).then(function (count) {
        return Area.update({
            _id: area
        },{
            Area_count: count
        });
    }).then(function () {
        data.message = '学校删除成功！';
        data.url = '/admin/school';
        res.render('admin/success',data);
    })
});

/*
* 留学列表
* */
router.get('/study_abroad',function (req, res) {
    Abroad.find().sort({_id:-1}).then(function (abroads) {
        data.abroads = abroads;
        res.render('admin/abroad/abroad_index',data);
    });
});

/*
* 留学添加
* */
router.get('/study_abroad/add',function (req, res) {
    res.render('admin/abroad/abroad_add',data);
});

/*
* 留学添加保存
* */
router.post('/study_abroad/add',function (req, res) {
    var abroad_name = req.body.abroad_name || '';
    if(!abroad_name){
        data.message = '留学名称不能为空！';
        res.render('admin/error',data);
        return ;
    }
    Abroad.findOne({Abroad_name:abroad_name}).then(function (rs) {
        if(rs){
            data.message = '留学名称不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            new Abroad({
                Abroad_name:abroad_name
            }).save().then(function () {
                data.message = '留学保存成功!';
                data.url = '/admin/study_abroad';
                res.render('admin/success',data);
            });
        }
    });
});

/*
* 留学修改
* */
router.get('/study_abroad/edit',function (req, res) {
    var id = req.query.id || '';

    Abroad.findById(id).then(function (rs) {
        if(!rs){
            data.message = '留学项目不存在！';
            res.render('admin/error',data);
            return ;
        }
        data.abroad = rs;
        res.render('admin/abroad/abroad_edit',data);
    });
});

/*
* 留学修改保存
* */
router.post('/study_abroad/edit',function (req,res) {
    var abroad_name = req.body.abroad_name || '',
        id = req.query.id || '';

    if(!abroad_name){
        data.message = '留学名称不能为空！';
        res.render('admin/error',data);
        return ;
    }

    Abroad.findOne({Abroad_name:abroad_name,_id:{$ne:id}}).then(function (rs) {
        if(rs){
            data.message = '留学名称不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return Abroad.update({
                _id: id
            },{
                Abroad_name: abroad_name
            });
        }
    }).then(function () {
        data.message = '留学修改成功！';
        data.url = '/admin/study_abroad';
        res.render('admin/success',data);
    });
});

/*
* 留学删除
* */
router.get('/study_abroad/delete',function (req,res) {
    var id = req.query.id || '';

    Abroad.findById(id).then(function (rs) {
        if(!rs){
            data.message = '所要删除的留学不存在！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return Abroad.remove({_id:id});
        }
    }).then(function () {
        data.message = '留学删除成功！';
        data.url = '/admin/study_abroad';
        res.render('admin/success',data);
    });
});

/*
* 留学导航列表
* */
router.get('/study_abroad/nav',function (req, res) {
    data.page = Number(req.query.page || 1);   //在实际开发可能还要对page进行判断，是否为数字之类
    data.limit = 20;
    data.pages = 0;

    //获取数据库中的条数
    Abroad_nav.count().then(function (count) {

        data.count = count;
        //计算总页数
        data.pages = Math.ceil(count / data.limit);

        //取值不能超过pages
        data.page = Math.min(data.page, data.pages);

        //取值不能小于1
        data.page = Math.max(data.page, 1);

        data.skip = (data.page - 1) * data.limit;

        /*
         * 从数据库中读取所有用户数据
         * */
        Abroad_nav.find().populate('abroad').sort({abroad:1,Abroad_nav_order:1}).limit(data.limit).skip(data.skip).then(function (rs) {
            data.abroad_navs = rs;
            data.forPage = 'study_abroad/nav';
            res.render('admin/abroad/abroad_nav_index',data);
        });
    });
});

/*
* 留学导航添加
* */
router.get('/study_abroad/nav/add',function (req, res) {
    Abroad.find().sort({_id:-1}).then(function (rs) {
        data.abroads = rs;
        res.render('admin/abroad/abroad_nav_add',data);
    });
});

/*
* 留学导航添加保存
* */
router.post('/study_abroad/nav/add',function (req, res) {
    var abroad = req.body.abroad,
        abroad_nav_name = req.body.abroad_nav_name || '',
        abroad_nav_url = req.body.abroad_nav_url,
        abroad_nav_order = Number(req.body.abroad_nav_order);

    if(!abroad_nav_name){
        data.message = '留学导航名称不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!abroad){
        data.message = '请选择留学项目！';
        res.render('admin/error',data);
        return ;
    }

    Abroad_nav.findOne({abroad: abroad,Abroad_nav_name:abroad_nav_name}).then(function (rs) {
        if(rs){
            data.message = '留学导航不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }
        new Abroad_nav({
            abroad: abroad,
            Abroad_nav_name: abroad_nav_name,
            Abroad_nav_url: abroad_nav_url,
            Abroad_nav_order: abroad_nav_order
        }).save().then(function () {
            Abroad_nav.find({abroad:abroad}).count().then(function (count) {
                Abroad.update({
                    _id:abroad
                },{
                    Abroad_count: count
                }).then(function () {
                    data.message = '留学导航添加成功！';
                    data.url = '/admin/study_abroad/nav';
                    res.render('admin/success',data);
                });
            });
        });
    });

});

/*
* 留学导航修改
* */
router.get('/study_abroad/nav/edit',function (req, res) {
    var id = req.query.id;

    Abroad_nav.findById(id).populate('abroad').then(function (rs) {
        data.abroad_nav = rs;
    }).then(function () {
        Abroad.find().sort({_id:-1}).then(function (rs) {
            data.abroads = rs;
            res.render('admin/abroad/abroad_nav_edit',data);
        })
    });
});

/*
* 留学导航修改保存
* */
router.post('/study_abroad/nav/edit',function (req, res) {
    var id = req.query.id,
        abroad = req.body.abroad || '',
        abroad_nav_name = req.body.abroad_nav_name || '',
        abroad_nav_url = req.body.abroad_nav_url,
        abroad_nav_order = Number(req.body.abroad_nav_order);

    if(!abroad){
        data.message = '请选择留学项目！';
        res.render('admin/error',data);
        return ;
    }

    if(!abroad_nav_name){
        data.message = '留学导航名称不能为空！';
        res.render('admin/error',data);
        return ;
    }

    Abroad_nav.findOne({abroad:abroad,Abroad_nav_name:abroad_nav_name,_id:{$ne:id}}).then(function (rs) {
        if(rs){
            data.message = '留学导航不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }

        Abroad_nav.update({
            _id: id
        },{
            abroad: abroad,
            Abroad_nav_name: abroad_nav_name,
            Abroad_nav_url: abroad_nav_url,
            Abroad_nav_order: abroad_nav_order
        }).then(function () {
            data.message = '修改保存成功！';
            data.url = '/admin/study_abroad/nav';
            res.render('admin/success',data);
        });
    });
});

/*
* 留学导航删除
* */
router.get('/study_abroad/nav/delete',function (req, res) {
    var id = req.query.id;

    Abroad_nav.findById(id).then(function (rs) {
        if(!rs){
            data.message = '要删除的留学导航不存在！';
            res.render('admin/error',data);
            return Promise.reject();
        }
        data.abroadC = rs.abroad;
        Abroad_nav.remove({_id:id}).then(function () {
            Abroad_nav.find({abroad:data.abroadC}).count().then(function (count) {
                Abroad.update({
                    _id: data.abroadC
                },{
                    Abroad_count: count
                }).then(function () {
                    data.message = '留学导航删除成功！';
                    data.url = '/admin/study_abroad/nav';
                    res.render('admin/success',data);
                });
            });
        });
    });
});

/*
* 留学导航文章列表
* */
router.get('/study_abroad/nav/content',function (req, res) {
    data.page = Number(req.query.page || 1);   //在实际开发可能还要对page进行判断，是否为数字之类
    data.limit = 20;
    data.pages = 0;

    //获取数据库中的条数
    Abroad_content.count().then(function (count) {

        data.count = count;
        //计算总页数
        data.pages = Math.ceil(count / data.limit);

        //取值不能超过pages
        data.page = Math.min(data.page, data.pages);

        //取值不能小于1
        data.page = Math.max(data.page, 1);

        data.skip = (data.page - 1) * data.limit;

        /*
         * 从数据库中读取所有用户数据
         * */
        Abroad_content.find().populate(['abroad','abroad_nav']).sort({abroad:1,abroad_nav:1,Abroad_content_order:1}).limit(data.limit).skip(data.skip).then(function (rs) {
            data.abroad_contents = rs;
            data.forPage = 'study_abroad/nav/content';
            res.render('admin/abroad/abroad_nav_content_index',data);
        });
    });
});

/*
* 留学导航文章添加
* */
router.get('/study_abroad/nav/content/add',function (req, res) {
    Abroad.find().sort({_id:-1}).then(function (rs) {
        data.abroads = rs;
        res.render('admin/abroad/abroad_nav_content_add',data);
    });
});

/*
* 留学导航文章添加保存
* */
router.post('/study_abroad/nav/content/add',function (req, res) {
    var abroad = req.body.abroad,
        abroad_nav = req.body.abroad_nav,
        abroad_content_name = req.body.abroad_content_name,
        abroad_content_url = req.body.abroad_content_url,
        abroad_content_order = Number(req.body.abroad_content_order);

    if(!abroad || !abroad_nav){
        data.message = '留学项目或者导航名称不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!abroad_content_name){
        data.message = '文章标题不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!abroad_content_url){
        data.message = '文章url不能为空！';
        res.render('admin/error',data);
        return ;
    }

    Abroad_content.findOne({abroad:abroad,abroad_nav:abroad_nav,Abroad_content_name:abroad_content_name}).then(function (rs) {
        if(rs){
            data.message = '文章标题不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }
        new Abroad_content({
            abroad: abroad,
            abroad_nav: abroad_nav,
            Abroad_content_name: abroad_content_name,
            Abroad_content_url: abroad_content_url,
            Abroad_content_order: abroad_content_order
        }).save().then(function () {
            Abroad_content.find({abroad_nav: abroad_nav}).count().then(function (count) {
                Abroad_nav.update({
                    _id: abroad_nav
                },{
                    Abroad_nav_count: count
                }).then(function () {
                    data.message = '文章标题保存成功！';
                    data.url = '/admin/study_abroad/nav/content';
                    res.render('admin/success',data);
                });
            });
        });
    });
});

/*
* 留学导航文章修改
* */
router.get('/study_abroad/nav/content/edit',function (req, res) {
    var id = req.query.id;

    if(!id){
        data.message = '所要修改的文章不存在！';
        res.render('admin/error',data);
        return ;
    }
    Abroad.find().sort({_id:-1}).then(function (rs) {
        data.abroads = rs;
        Abroad_nav.find().sort({abroad: 1}).then(function (rs) {
            data.abroad_navs = rs;
            Abroad_content.findById(id).populate(['abroad','abroad_nav']).then(function (rs) {
                data.abroad_content = rs;
                res.render('admin/abroad/abroad_nav_content_edit',data);
            });
        });
    });
});

/*
* 留学导航文章修改保存
* */
router.post('/study_abroad/nav/content/edit',function (req, res) {
    var id = req.query.id,
        abroad = req.body.abroad,
        abroad_nav = req.body.abroad_nav,
        abroad_content_name = req.body.abroad_content_name,
        abroad_content_url = req.body.abroad_content_url,
        abroad_content_order = Number(req.body.abroad_content_order);
    if(!abroad || !abroad_nav){
        data.message = '留学项目或者留学导航不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!abroad_content_name){
        data.message = '文章标题不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!abroad_content_url){
        data.message = '文章url不能为空！';
        res.render('admin/error',data);
        return ;
    }

    Abroad_content.findOne({abroad:abroad,abroad_nav:abroad_nav,Abroad_content_name:abroad_content_name,_id:{$ne: id}}).then(function (rs) {
        if(rs){
            data.message = '文章标题不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }

        Abroad_content.update({
            _id:id
        },{
            abroad: abroad,
            abroad_nav: abroad_nav,
            Abroad_content_name: abroad_content_name,
            Abroad_content_url: abroad_content_url,
            Abroad_content_order: abroad_content_order
        }).then(function () {
            data.message = '文章标题修改成功！';
            data.url = '/admin/study_abroad/nav/content';
            res.render('admin/success',data);
        });
    });
});

/*
* 留学导航文章删除
* */
router.get('/study_abroad/nav/content/delete',function (req, res) {
    var id = req.query.id;

    Abroad_content.findById(id).then(function (rs) {
        if(!rs){
            data.message = '要删除的文章标题不存在！';
            res.render('admin/error',data);
            return Promise.reject();
        }
        data.abroadC = rs.abroad_nav;
        Abroad_content.remove({_id:id}).then(function () {
            Abroad_content.find({abroad_nav:data.abroadC}).count().then(function (count) {
                Abroad_nav.update({
                    _id: data.abroadC
                },{
                    Abroad_nav_count: count
                }).then(function () {
                    data.message = '文章标题删除成功！';
                    data.url = '/admin/study_abroad/nav/content';
                    res.render('admin/success',data);
                });
            });
        });
    });
});

//返回出去给app.js
module.exports = router;