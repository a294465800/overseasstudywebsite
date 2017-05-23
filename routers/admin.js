/**
 * Created by SHINING on 2017/3/19.
 */
/*
* 后台路由
* */

var express = require('express'),
    router = express.Router(),
    formidable = require('formidable'),
    fs = require('fs'),
    User = require('../models/User'),
    Navigation = require('../models/Navigation'),
    Nav_title = require('../models/Nav_title'),
    Nav_content = require('../models/Nav_content'),
    Area = require('../models/Area'),
    School = require('../models/School'),
    Abroad = require('../models/Abroad'),
    Test = require('../models/Test'),
    Abroad_nav = require('../models/Abroad_nav'),
    Abroad_content = require('../models/Abroad_content'),
    Abroad_enroll = require('../models/Abroad_enroll'),
    Training = require('../models/Training'),
    Training_content = require('../models/Training_content'),
    Teacher = require('../models/Teacher'),
    Abroad_transparent = require('../models/Abroad_transparent'),
    Abroad_t_title = require('../models/Abroad_t_title'),
    markdown = require('markdown').markdown,
    Leave_message = require('../models/Leave_message'),
    data;

/*
 * 处理分页的函数
 * */
function setArrFont(sum) {
    var arr = [];
    for(var i = 0;i<sum;i++){
        arr[i] = i+1;
    }
    return arr;
}

function setArrEnd(sum) {
	if(sum >= 5){
		var arr = [],
			a = sum;
		for(var i = 0;i<5;i++){
			arr[i] = a;
			a--;
		}
		return arr.reverse();
	}else{
		var arr = [],
			a = sum;
		for(var i = 0;i<5;i++){
			arr[i] = a;
			a--;
		}
	}
}

function calculatePages(count) {
    data.count = count;
    //计算总页数
    data.pages = Math.ceil(count / data.limit);
    data.pagesFont = setArrFont(data.pages);
    data.pagesEnd  = setArrEnd(data.pages);

    //取值不能超过pages
    data.page = Math.min(data.page, data.pages);
    //取值不能小于1
    data.page = Math.max(data.page, 1);
    //跳过的条数
    data.skip = (data.page - 1) * data.limit;
}
/*
* 通用数据
* */
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
        limit: 20,
        count: 0,
	    warning: '如果图片已存在，将会覆盖！（图片大小不超过2m，只允许jpg和png）'
};
    next();
});

router.use(function (req, res, next) {
    if(!req.userInfo.isAdmin){
        //如果当前用户是非管理员
        res.send('对不起，只有管理员才可以进入后台管理');
        return ;  //return不能省，因为要阻止后面的next进行,next应该就是退出路由执行下面的路由的意思
    }
    //这里的next不能省
    next();
});

/*
 * 首页
 * */
router.get('/',function (req, res) {
    res.render('admin/index', data);
});

/*
* 用户管理
* */
router.get('/user',function (req, res) {
    data.page = Number(req.query.page) || 1;
    //获取数据库中的条数
    User.count().then(function (count) {
        calculatePages(count);
        User.find().sort({_id:-1}).limit(data.limit).skip(data.skip).then(function (users) {
            data.forPage = 'user';
            data.users = users;
            res.render('admin/user/user_index', data);
        });
    });
});

/*
* 用户添加
* */
router.get('/user/add',function (req, res) {
    res.render('admin/user/user_add', data);
});

/*
* 用户添加保存
* */
router.post('/user/add',function (req, res) {
    var username = req.body.username || '',
        password = req.body.password || '',
        isAdmin = req.body.isAdmin || false;
    if(username === '' || password === ''){
        data.message = '用户名称或者密码不能为空！';
        res.render('admin/error', data);
        return ;
    }

    //判断是否有相同名字的用户
    User.findOne({
        username: username
    }).then(function (rs) {
        if(rs){
            data.message = '用户已经存在！';
            res.render('admin/error', data);
            return Promise.reject();
        }else{
            //数据库不存在该用户，可以保存
            return new User({
                username: username,
                password: password,
                isAdmin: isAdmin
            }).save();
        }
    }).then(function () {
        data.message = '用户保存成功！';
        data.url = '/admin/user';
        res.render('admin/success', data);
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
            data.message = '用户信息不存在！';
            res.render('admin/error', data);
            return Promise.reject();
        }else{
            data.user = rs;
            res.render('admin/user/user_edit', data);
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

    if(username === '' || password === ''){
        data.message = '用户名称或者密码不能为空！';
        res.render('admin/error', data);
        return ;
    }

    User.findOne({
        _id: id
    }).then(function (rs) {
        if(!rs){
            data.message = '用户信息不存在！';
            res.render('admin/error', data);
            return Promise.reject();
        }else{
            //当用户没有修改名称和密码提交的时候
            if(username === rs.username && password === rs.password){
                User.update({
                    _id: id
                },{
                    username: username,
                    password: password,
                    isAdmin: isAdmin
                }).then(function () {
                    data.message = '用户信息修改成功！';
                    data.url = '/admin/user';
                    res.render('admin/success', data);
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
            data.message = '数据库中已经存在同名用户！';
            res.render('admin/error', data);
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
        data.message = '用户信息修改成功！';
        data.url = '/admin/user';
        res.render('admin/success', data);
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
        data.message = '删除成功!';
        data.url = '/admin/user';
        res.render('admin/success', data);
    });
});

/*
* 导航管理首页
* */
router.get('/navigation',function (req, res) {
    Navigation.find().sort({Nav_order:1}).then(function (navigations) {
        data.navigations = navigations;
        res.render('admin/navigation/navigation_index', data);
    });
});

/*
* 导航添加
* */
router.get('/navigation/add',function (req, res) {
    res.render('admin/navigation/navigation_add', data);
});

/*
* 导航添加的保存
* */
router.post('/navigation/add',function (req, res) {
    var Nav_name = req.body.Nav_name || '',
        Nav_order = Number(req.body.Nav_order),
        Nav_url = req.body.Nav_url || '/';
    if(Nav_name === ''){
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
    }).then(function () {
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

    if(Nav_name === ''){
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
            if(Nav_name === rs.Nav_name){
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
    data.page = Number(req.query.page) || 1;
    //获取数据库中的条数
    Nav_title.count().then(function (count) {

        calculatePages(count);
        Nav_title.find().sort({navigation:1,Nav_title_order:1}).limit(data.limit).skip(data.skip).populate('navigation').then(function (Nav_titles) {
            data.forPage = 'navigation/title';
            data.Nav_titles = Nav_titles;
            res.render('admin/navigation/navigation_title', data);
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
    if(navigation === ''){
        data.message = '导航分类不能为空！';
        res.render('admin/error', data);
        return ;
    }
    if(title === ''){
        data.message = '导航内容标题不能为空！';
        res.render('admin/error', data);
        return ;
    }

    Nav_title.findOne({
        navigation: navigation,
        Nav_title: title
    }).then(function (sameTitle) {
        if(sameTitle){
            data.message = '导航内容标题不能重复！';
            res.render('admin/error', data);
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
                        data.message = '导航内容标题保存成功！';
                        data.url = '/admin/navigation/title';
                        res.render('admin/success', data);
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
            data.message = '导航内容标题不存在！';
            res.render('admin/error', data);
            return Promise.reject();
        }else {
            data.navigations = navigations;
            data.nav_title = nav_title;
            res.render('admin/navigation/navigation_title_edit', data);
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
    }).populate('navigation').then(function () {
        if (req.body.navigation === '') {
            data.message = '导航名称不能为空！';
            res.render('admin/error', data);
            return Promise.reject();
        } else if (title === '') {
            data.message = '内容标题不能为空！';
            res.render('admin/error', data);
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
            data.message = '导航内容标题不能重复！';
            res.render('admin/error', data);
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
    }).then(function () {
        data.message = '内容修改保存成功';
        data.url = '/admin/navigation/title';
        res.render('admin/success', data);
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
                    data.message = '删除成功!';
                    data.url = '/admin/navigation/title';
                    res.render('admin/success', data);
                });
            });
        });
    });
});

/*
* 标题内容列表
* */
router.get('/navigation/title/content',function (req, res) {
    data.page = Number(req.query.page) || 1;
    //获取数据库中的条数
    Nav_content.count().then(function (count) {
        calculatePages(count);
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

    if(navigation === '' || nav_title === ''){
        data.message = '导航名称或者导航标题不能为空！';
        res.render('admin/error',data);
        return ;
    }

    if(Nav_content_name === ''){
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

    if(navigation === '' || nav_title === ''){
        data.message = '导航或者导航标题不能为空！';
        res.render('admin/error',data);
        return ;
    }

    if(Nav_content_name === ''){
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
    if(area_name === ''){
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
    data.page = Number(req.query.page) || 1;
    //获取数据库中的条数
    School.count().then(function (count) {
        calculatePages(count);
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
        school_url = req.body.school_url || '/',
        school_img = req.body.school_img;

    if(area_name === ''){
        data.message = '学校地区不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(school_zn === '' || school_en === ''){
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
                School_url: school_url,
	            School_img: school_img
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
    }).then(function () {
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
        school_url = req.body.school_url,
	    school_img = req.body.school_img;

    if(area_name === ''){
        data.message = '学校地区不能为空！';
        res.render('admin/error',data);
        return ;
    }

    if(school_zn === '' || school_en === ''){
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
                School_url: school_url,
	            School_img: school_img
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
*考试列表
* */
router.get('/study_abroad/test',function (req, res) {
    Test.find().sort({Test_order: 1}).then(function (rs) {
        data.tests = rs;
        res.render('admin/abroad/abroad_test_index',data);
    });
});

/*
* 考试添加
* */
router.get('/study_abroad/test/add',function (req, res) {
    res.render('admin/abroad/abroad_test_add',data);
});

/*
* 考试添加保存
* */
router.post('/study_abroad/test/add',function (req, res) {
    var test_name = req.body.test_name,
        test_url = req.body.test_url || '/',
        test_order = Number(req.body.test_order);
    if(!test_name){
        data.message = '考试名称不能为空！';
        res.render('admin/error',data);
        return ;
    }

    Test.findOne({Test_name: test_name}).then(function (rs) {
        if(rs){
            data.message = '考试名称不能重复！';
            res.render('admin/error',data);
            return ;
        }
        new Test({
            Test_name: test_name,
            Test_url: test_url,
            test_order: test_order
        }).save().then(function () {
            data.message = '考试保存成功！';
            data.url = '/admin/study_abroad/test';
            res.render('admin/success',data);
        });
    });
});

/*
* 考试修改
* */
router.get('/study_abroad/test/edit',function (req, res) {
    var id = req.query.id;

    Test.findById({_id:id}).then(function (rs) {
        if(!rs){
            data.message = '所要修改的项目不存在！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            data.test = rs;
            res.render('admin/abroad/abroad_test_edit',data);
        }
    });
});

/*
* 考试修改保存
* */
router.post('/study_abroad/test/edit',function (req, res) {
    var id = req.query.id,
        test_name = req.body.test_name,
        test_url = req.body.test_url || '/',
        test_order = Number(req.body.test_order);

    if(!test_name){
        data.message = '考试名称不能为空！';
        res.render('admin/error',data);
        return ;
    }

    Test.findOne({Test_name:test_name,_id: {$ne: id}}).then(function (rs) {
        if(rs){
            data.message = '考试名称不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return Test.update({
                _id: id
            },{
                Test_name: test_name,
                Test_url: test_url,
                Test_order: test_order
            });
        }
    }).then(function () {
        data.message = '考试名称修改成功！';
        data.url = '/admin/study_abroad/test';
        res.render('admin/success',data);
    });
});

/*
* 考试删除
* */
router.get('/study_abroad/test/delete',function (req, res) {
    var id = req.query.id;

    Test.findById({_id:id}).then(function (rs) {
        if(!rs){
            data.message = '所要删除的项目不存在！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return Test.remove({_id: id});
        }
    }).then(function () {
        data.message = '考试删除成功！';
        data.url = '/admin/study_abroad/test';
        res.render('admin/success',data);
    });
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
    var id = req.query.id;

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
    data.page = Number(req.query.page) || 1;
    //获取数据库中的条数
    Abroad_nav.count().then(function (count) {
        calculatePages(count);
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
    data.page = Number(req.query.page) || 1;
    //获取数据库中的条数
    Abroad_content.count().then(function (count) {
        calculatePages(count);
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
        abroad_content_order = Number(req.body.abroad_content_order),
	    abroad_content_markdown = req.body.abroad_content_markdown;

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
            Abroad_content_order: abroad_content_order,
            Abroad_content_markdown: abroad_content_markdown
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
        abroad_content_order = Number(req.body.abroad_content_order),
	    abroad_content_markdown = req.body.abroad_content_markdown;

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
            Abroad_content_order: abroad_content_order,
            Abroad_content_markdown: abroad_content_markdown
        }).then(function () {
            data.message = '文章修改成功！';
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

/*
* 录取案例列表
* */
router.get('/study_abroad/nav/enroll',function (req, res) {
    data.page = Number(req.query.page) || 1;
    //获取数据库中的条数
    Abroad_enroll.count().then(function (count) {
        calculatePages(count);
        Abroad_enroll.find().populate(['abroad','school','test1','test2']).sort({abroad:1,Abroad_enroll_order:1}).limit(data.limit).skip(data.skip).then(function (rs) {
            data.abroad_enrolls = rs;
            data.forPage = 'study_abroad/nav/enroll';
            res.render('admin/abroad/abroad_nav_enroll_index',data);
        });
    });
});

/*
* 录取案例添加
* */
router.get('/study_abroad/nav/enroll/add',function (req, res) {
    Abroad.find().sort({_id:-1}).then(function (rs) {
        data.abroads = rs;
        Test.find().sort({Test_order: 1}).then(function (rs) {
            data.tests = rs;
            res.render('admin/abroad/abroad_nav_enroll_add',data);
        });
    });
});

/*
* 录取案例添加保存
* */
router.post('/study_abroad/nav/enroll/add',function (req, res) {
    var abroad =req.body.abroad,
        abroad_enroll_name = req.body.abroad_enroll_name,
        school_zn = req.body.school,
        abroad_enroll_subject = req.body.abroad_enroll_subject,
        abroad_enroll_student = req.body.abroad_enroll_student,
        abroad_enroll_code = req.body.abroad_enroll_code,
        test1 = req.body.test1,
        test2 = req.body.test2,
        abroad_enroll_score1 = parseFloat(req.body.abroad_enroll_score1).toFixed(2),
        abroad_enroll_score2 = parseFloat(req.body.abroad_enroll_score2).toFixed(2),
        abroad_enroll_url = req.body.abroad_enroll_url,
        abroad_enroll_order = req.body.abroad_enroll_order,
        school_id;

    if(!abroad){
        data.message = '留学项目不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!school_zn){
        data.message = '录取学校不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!abroad_enroll_student){
        data.message = '录取学生姓名不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!test1 || !test2){
        data.message = '考试科目不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(test1 === test2){
        data.message = '两个考试科目重复！';
        res.render('admin/error',data);
        return ;
    }

    School.findOne({School_zn: school_zn}).then(function (rs) {
        if(!rs){
            data.message = '录取的学校不存在！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            school_id = rs._id;
            Abroad_enroll.findOne({Abroad_enroll_student: abroad_enroll_student}).then(function (rs) {
                if(rs){
                    data.message = '该学生信息已存在！';
                    res.render('admin/error',data);
                    return ;
                }
                new Abroad_enroll({
                    abroad: abroad,
                    school: school_id,
                    test1: test1,
                    test2: test2,
                    Abroad_enroll_score1: abroad_enroll_score1,
                    Abroad_enroll_score2: abroad_enroll_score2,
                    Abroad_enroll_name: abroad_enroll_name,
                    Abroad_enroll_subject: abroad_enroll_subject,
                    Abroad_enroll_student: abroad_enroll_student,
                    Abroad_enroll_code: abroad_enroll_code,
                    Abroad_enroll_url: abroad_enroll_url,
                    Abroad_enroll_order: abroad_enroll_order
                }).save().then(function () {
                    Abroad_enroll.find({school: school_id}).count().then(function (count) {
                        School.update({
                            _id: school_id
                        },{
                            School_enroll: count
                        }).then(function () {
                            data.message = '录取案例保存成功！';
                            data.url = '/admin/study_abroad/nav/enroll';
                            res.render('admin/success',data);
                        });
                    });
                });
            });
        }
    });
});

/*
* 录取案例修改
* */
router.get('/study_abroad/nav/enroll/edit',function (req, res) {
    var id = req.query.id;

    Abroad_enroll.findById(id).populate(['abroad','school','test1','test2']).then(function (rs) {
        if(!rs){
            data.message = '要修改的录取案例不存在！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            data.abroad_enroll = rs;
            Abroad.find().then(function (rs) {
                data.abroads = rs;
            }).then(function () {
                Test.find().sort({Test_order: 1}).then(function (rs) {
                    data.tests = rs;
                    res.render('admin/abroad/abroad_nav_enroll_edit',data);
                });
            });
        }
    });
});

/*
* 录取案例修改保存
* */
router.post('/study_abroad/nav/enroll/edit',function (req, res) {
    var id = req.query.id,
        abroad =req.body.abroad,
        abroad_enroll_name = req.body.abroad_enroll_name,
        school_zn = req.body.school,
        abroad_enroll_subject = req.body.abroad_enroll_subject,
        abroad_enroll_student = req.body.abroad_enroll_student,
        abroad_enroll_code = req.body.abroad_enroll_code,
        test1 = req.body.test1,
        test2 = req.body.test2,
        abroad_enroll_score1 = parseFloat(req.body.abroad_enroll_score1).toFixed(2),
        abroad_enroll_score2 = parseFloat(req.body.abroad_enroll_score2).toFixed(2),
        abroad_enroll_url = req.body.abroad_enroll_url,
        abroad_enroll_order = req.body.abroad_enroll_order,
        school_id;

    if(!abroad){
        data.message = '留学项目不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!school_zn){
        data.message = '录取学校不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!abroad_enroll_student){
        data.message = '录取学生姓名不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!test1 || !test2){
        data.message = '考试科目不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(test1 === test2){
        data.message = '两个考试科目重复！';
        res.render('admin/error',data);
        return ;
    }

    School.findOne({School_zn: school_zn}).then(function (rs) {
        if(!rs){
            data.message = '录取的学校不存在！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            school_id = rs._id;
            Abroad_enroll.findOne({Abroad_enroll_student: abroad_enroll_student,_id:{$ne:id}}).then(function (rs) {
                if(rs){
                    data.message = '该学生信息已存在！';
                    res.render('admin/error',data);
                    return ;
                }
                Abroad_enroll.update({
                    _id: id
                },{
                    abroad: abroad,
                    school: school_id,
                    test1: test1,
                    test2: test2,
                    Abroad_enroll_score1: abroad_enroll_score1,
                    Abroad_enroll_score2: abroad_enroll_score2,
                    Abroad_enroll_name: abroad_enroll_name,
                    Abroad_enroll_subject: abroad_enroll_subject,
                    Abroad_enroll_student: abroad_enroll_student,
                    Abroad_enroll_code: abroad_enroll_code,
                    Abroad_enroll_url: abroad_enroll_url,
                    Abroad_enroll_order: abroad_enroll_order
            }).then(function () {
                    data.message = '录取案例保存成功！';
                    data.url = '/admin/study_abroad/nav/enroll';
                    res.render('admin/success',data);
                });
            });
        }
    });
});

/*
* 录取案例删除
* */
router.get('/study_abroad/nav/enroll/delete',function (req, res) {
    var id = req.query.id,
        enroll_school;

    Abroad_enroll.findById(id).populate('school').then(function (rs) {
        if(!rs){
            data.message = '要删除的案例不存在！';
            res.render('admin/error',data);
        }else{
            enroll_school = rs.school._id;
            return Abroad_enroll.remove({_id:id});
        }
    }).then(function () {
        Abroad_enroll.find({school: enroll_school}).count().then(function (count) {
            School.update({
                _id: enroll_school
            },{
                School_enroll: count
            }).then(function () {
                data.message = '案例删除成功！';
                data.url = '/admin/study_abroad/nav/enroll';
                res.render('admin/success',data);
            });
        });
    });
});

/*
* 培训分类列表
* */
router.get('/training',function (req, res) {
    data.page = Number(req.query.page) || 1;
    Training.find().count().then(function (count) {
        calculatePages(count);
        data.forPage = 'training';
        Training.find().populate('test').sort({test:1,Training_order: 1}).limit(data.limit).skip(data.skip).then(function (rs) {
            data.trainings = rs;
            res.render('admin/training/training_category_index',data);
        });
    });
});

/*
 * 培训分类添加
 * */
router.get('/training/add',function (req, res) {
    Test.find().sort({Test_order: 1}).then(function (rs) {
        data.tests = rs;
        res.render('admin/training/training_category_add',data);
    });
});

/*
* 培训分类添加保存
* */
router.post('/training/add',function (req, res) {
    var test = req.body.test,
        training_name = req.body.training_name,
        training_url = req.body.training_url || '/',
        training_order = Number(req.body.training_order);
    if(!test){
        data.message = '考试项目不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!training_name){
        data.message = '培训分类名称不能为空！';
        res.render('admin/error',data);
        return ;
    }

    Training.findOne({test: test,Training_name: training_name}).then(function (rs) {
        if(rs){
            data.message = '培训分类名称不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return new Training({
                test: test,
                Training_name: training_name,
                Training_url: training_url,
                Training_order: training_order
            }).save();
        }
    }).then(function () {
        Training.find({test: test}).count().then(function (count) {
            return Test.update({_id: test},{Test_count: count});
        }).then(function () {
            data.message = '培训分类添加成功！';
            data.url = '/admin/training';
            res.render('admin/success',data);
        });
    });
});

/*
* 培训分类修改
* */
router.get('/training/edit',function (req, res) {
    var id = req.query.id;
    Test.find().sort({Test_order: 1}).then(function (rs) {
        data.tests =rs;
        Training.findById(id).populate('test').then(function (rs) {
            if(!rs){
                data.message = '所要修改的培训分类不存在！';
                res.render('admin/error',data);
                return Promise.reject();
            }else{
                data.training = rs;
                res.render('admin/training/training_category_edit',data);
            }
        });
    });
});

/*
* 培训分类修改保存
* */
router.post('/training/edit',function (req, res) {
    var id = req.query.id,
        test = req.body.test,
        training_name = req.body.training_name,
        training_url = req.body.training_url || '/',
        training_order = Number(req.body.training_order);

    if(!test){
        data.message = '考试项目不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!training_name){
        data.message = '培训分类名称不能为空！';
        res.render('admin/error',data);
        return ;
    }

    Training.findOne({test: test,_id:{$ne:id},Training_name: training_name}).then(function (rs) {
        if(rs){
            data.message = '培训分类名称不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return Training.update({
                _id:id
            },{
                test: test,
                Training_name: training_name,
                Training_url: training_url,
                Training_order: training_order
            });
        }
    }).then(function () {
        data.message = '培训分类修改成功！';
        data.url = '/admin/training';
        res.render('admin/success',data);
    });
});

/*
* 培训分类删除
* */
router.get('/training/delete',function (req, res) {
    var id = req.query.id,
        test;
    Training.findById(id).populate('test').then(function (rs) {
        if(!rs){
            data.message = '要删除的培训分类不存在！';
            res.render('admin/error',data);
        }else{
            test = rs.test._id;
            return Training.remove({_id:id});
        }
    }).then(function () {
        Training.find({test: test}).count().then(function (count) {
            return Test.update({_id: test},{Test_count: count});
        }).then(function () {
            data.message = '培训分类删除成功！';
            data.url = '/admin/training';
            res.render('admin/success',data);
        });
    });
});

/*
* 培训文章列表
* */
router.get('/training/content',function (req, res) {
    data.page = Number(req.query.page) || 1;
    Training_content.find().count().then(function (count) {
        calculatePages(count);
        data.forPage = 'training/content';
        Training_content.find().populate(['test','training']).sort({test:1,training:1,Training_content_order:1}).limit(data.limit).skip(data.skip).then(function (rs) {
            data.training_contents = rs;
            res.render('admin/training/training_content_index',data);
        });
    });
});

/*
 * 培训文章添加
 * */
router.get('/training/content/add',function (req, res) {
    Test.find().sort({Test_order:1}).then(function (rs) {
        data.tests = rs;
        res.render('admin/training/training_content_add',data);
    });
});

/*
* 培训文章添加保存
* */
router.post('/training/content/add',function (req, res) {
    var test = req.body.test,
        training = req.body.training,
        training_content_name = req.body.training_content_name,
        training_content_url = req.body.training_content_url || '/',
        training_content_order = Number(req.body.training_content_order || 10),
	    training_content_markdown = req.body.training_content_markdown;

    if(!test || !training){
        data.message = '考试项目或者培训分类不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!training_content_name){
        data.message = '培训分类文章标题不能为空！';
        res.render('admin/error',data);
        return ;
    }

    Training_content.findOne({test: test,training: training,Training_content_name:training_content_name}).then(function (rs) {
        if(rs){
            data.message = '培训分类文章标题不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return new Training_content({
                test: test,
                training: training,
                Training_content_name: training_content_name,
                Training_content_url: training_content_url,
                Training_content_order: training_content_order,
                Training_content_markdown: training_content_markdown
            }).save();
        }
    }).then(function () {
        Training_content.find({test: test,training: training}).count().then(function (count) {
            Training.update({
                _id: training
            },{
                Training_count: count
            }).then(function () {
                data.message = '培训文章添加成功！';
                data.url = '/admin/training/content';
                res.render('admin/success',data);
            });
        });
    });
});

/*
* 培训文章修改
* */
router.get('/training/content/edit',function (req, res) {
    var id = req.query.id;
    Test.find().sort({Test_order:1}).then(function (rs) {
        data.tests = rs;
        Training_content.findById(id).populate('test').then(function (re) {
            if(!re){
                data.message = '要修改的培训文章不存在！';
                res.render('admin/error',data);
                return Promise.reject();
            }else{
                data.training_content = re;
                Training.find({test: data.training_content.test._id}).sort({Training_order:1}).then(function (rs) {
                    data.trainings = rs;
                    res.render('admin/training/training_content_edit',data);
                });
            }
        });
    });
});

/*
* 培训文章修改保存
* */
router.post('/training/content/edit',function (req, res) {
    var id = req.query.id,
        test = req.body.test,
        training = req.body.training,
        training_content_name = req.body.training_content_name,
        training_content_url = req.body.training_content_url || '/',
        training_content_order = Number(req.body.training_content_order || 10),
	    training_content_markdown = req.body.training_content_markdown;

    if(!test || !training){
        data.message = '考试项目或者培训分类不能为空！';
        res.render('admin/error',data);
        return ;
    }
    if(!training_content_name){
        data.message = '培训文章标题不能为空！';
        res.render('admin/error',data);
        return ;
    }

    Training_content.findOne({Training_content_name: training_content_name,_id: {$ne:id}}).then(function (rs) {
        if(rs){
            data.message = '培训文章标题不能重复！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            return Training_content.update({
                _id: id
            },{
                test: test,
                training: training,
                Training_content_name: training_content_name,
                Training_content_url: training_content_url,
                Training_content_order: training_content_order,
	            Training_content_markdown: training_content_markdown
            });
        }
    }).then(function () {
        data.message = '培训文章修改成功！';
        data.url = '/admin/training/content';
        res.render('admin/success',data);
    });
});

/*
* 培训文章删除
* */
router.get('/training/content/delete',function (req, res) {
    var id = req.query.id,
        training;

    Training_content.findById(id).populate('training').then(function (rs) {
        if(!rs){
            data.message = '要删除的文章不存在！';
            res.render('admin/error',data);
            return Promise.reject();
        }else{
            training = rs.training._id;
            return Training_content.remove({_id: id});
        }
    }).then(function () {
        Training_content.find({training: training}).count().then(function (count) {
            console.log(training);
            Training.update({_id: training},{Training_count:count}).then(function () {
                data.message = '培训文章删除成功！';
                data.url = '/admin/training/content';
                res.render('admin/success',data);
            });
        });
    });
});

/*
* 教师列表
* */
router.get('/teacher',function (req, res) {
	data.page = Number(req.query.page) || 1;
	Teacher.find().count().then(function (count) {
		calculatePages(count);
		data.forPage = 'teacher';
		Teacher.find().sort({Teacher_order: 1}).limit(data.limit).skip(data.skip).then(function (rs) {
			data.teachers = rs;
			res.render('admin/teacher/teacher_index',data);
		});
	});
});

/*
* 教师添加
* */
router.get('/teacher/add',function (req, res) {
    res.render('admin/teacher/teacher_add',data);
});

/*
 * 教师添加保存
 * */
router.post('/teacher/add',function (req, res) {
	var teacher_name = req.body.teacher_name,
		teacher_intro = req.body.teacher_intro,
		teacher_img = req.body.teacher_img,
		teacher_url = req.body.teacher_url || '/',
		teacher_order = Number(req.body.teacher_order || 0),
		teacher_background = req.body.teacher_background;

	if(!teacher_name){
		data.message = '教师名称不能为空';
		res.render('admin/error',data);
		return ;
	}

	new Teacher({
		Teacher_name: teacher_name,
		Teacher_intro: teacher_intro,
		Teacher_img: teacher_img,
		Teacher_url: teacher_url,
		Teacher_order: teacher_order,
		Teacher_background: teacher_background
	}).save().then(function () {
		data.message = '教师信息保存成功！';
		data.url = '/admin/teacher';
		res.render('admin/success',data);
	});
});

/*
* 教师修改
* */
router.get('/teacher/edit',function (req, res) {
	var id = req.query.id;

	Teacher.findById(id).then(function (rs) {
		if(!rs){
			data.message = '所要修改的教师信息不存在！';
			res.render('admin/error',data);
			return Promise.reject();
		}
		data.teacher = rs;
		res.render('admin/teacher/teacher_edit',data);
	})
});

/*
 * 教师修改保存
 * */
router.post('/teacher/edit',function (req, res) {
	var id = req.query.id,
		teacher_name = req.body.teacher_name,
		teacher_intro = req.body.teacher_intro,
		teacher_img = req.body.teacher_img,
		teacher_url = req.body.teacher_url || '/',
		teacher_order = Number(req.body.teacher_order || 0),
		teacher_background = req.body.teacher_background;

	if(!teacher_name){
		data.message = '教师名称不能为空！';
		res.render('admin/error',data);
		return ;
	}

	Teacher.update({_id: id},{
		Teacher_name: teacher_name,
		Teacher_intro: teacher_intro,
		Teacher_img: teacher_img,
		Teacher_url: teacher_url,
		Teacher_order: teacher_order,
		Teacher_background: teacher_background
	}).then(function () {
		data.message = '教师信息修改成功！';
		data.url = '/admin/teacher';
		res.render('admin/success',data);
	});
});

/*
* 教师删除
* */
router.get('/teacher/delete',function (req, res) {
	var id = req.query.id;

	Teacher.findById(id).then(function (rs) {
		if(!rs){
			data.message = '所要删除的教师信息不存在！';
			res.render('admin/error',data);
			return Promise.reject();
		}
		Teacher.remove({_id: id}).then(function () {
			data.message = '教师信息删除成功！';
			data.url = '/admin/teacher';
			res.render('admin/success',data);
		})
	})
});

/*
* 文件上传--学校
* */
router.get('/file_upload/school',function (req, res) {
    data.message = '学校图片上传';
    res.render('admin/fileupload/fileupload_index',data);
});

/*
* 学校图片上传保存
* */
router.post('/file_upload/school',function (req, res) {
	var form = new formidable.IncomingForm();   //创建上传表单
	form.encoding = 'utf-8';    //设置编码
	form.uploadDir = 'public/images/school/';     //设置上传目录
	form.keepExtensions = true;     //保留后缀
	form.maxFieldsSize = 2 * 1024 * 1024;   //限制文件大小，2m
	form.multiples = true;      //允许多文件上传

	form.parse(req, function (err, fields, files) {     //错误， 字段域， 文件信息
		if(err){
			data.message = err;
			res.render('admin/error',data);
			return ;
		}

        /*
         * 保留文件原来名字
         * */
		if(files.files.length){
			//如果同时上传多个文件，返回的是数组，对所有数组中的文件重命名
			for(var i = 0; i < files.files.length;i++){
				fs.renameSync(files.files[i].path, form.uploadDir + files.files[i].name);  //重命名
			}
		}else{
			//对单一文件进行重命名
			fs.renameSync(files.files.path, form.uploadDir + files.files.name);  //重命名
		}
		data.school_img_num = files.files.length || 1;
	});
	form.on('end', function() {
		data.message = '上传成功，共上传了' + data.school_img_num + '张图片';
		res.json(data);
	});
});

/*
* 学校图片列表
* */
router.get('/file_upload/school/list',function (req, res) {
	var path = 'public/images/school';
	var fileArray = fs.readdirSync(path);
	data.fileArray = [];
	data.page = Number(req.query.page) || 1;

	for(var i = (data.page - 1) * data.limit; i < (data.page) * data.limit; i++ ){
		if(fileArray[i]){
			data.fileArray.push(fileArray[i]);
		}
	}
	data.count = fileArray.length;
	data.forPage = 'file_upload/school/list';
	calculatePages(data.count);
	res.render('admin/fileupload/fileupload_school_list',data);
});

/*
* 学校图片删除
* */
router.get('/file_upload/school/list/delete',function (req, res) {
	var name = req.query.filename,
		path = 'public/images/school';

	fs.unlink(path + '/' + name, function (err) {
		if(err){
			data.message = err;
			res.render('admin/error',data);
		}else{
			data.message = '删除文件' + name + '成功！';
			data.url = '/admin/file_upload/school/list';
			res.render('admin/success',data);
		}
	});
});

/*
 * 文件上传--教师
 * */
router.get('/file_upload/teacher',function (req, res) {
	data.message = '教师图片上传';
	res.render('admin/fileupload/fileupload_index',data);
});

/*
 * 教师图片上传保存
 * */
router.post('/file_upload/teacher',function (req, res) {
	var form = new formidable.IncomingForm();   //创建上传表单
	form.encoding = 'utf-8';    //设置编码
	form.uploadDir = 'public/images/teacher/';     //设置上传目录
	form.keepExtensions = true;     //保留后缀
	form.maxFieldsSize = 2 * 1024 * 1024;   //限制文件大小，2m
	form.multiples = true;      //允许多文件上传

	form.parse(req, function (err, fields, files) {     //错误， 字段域， 文件信息
		if(err){
			data.message = err;
			res.render('admin/error',data);
			return ;
		}

		/*
		 * 保留文件原来名字
		 * */
		if(files.files.length){
			//如果同时上传多个文件，返回的是数组，对所有数组中的文件重命名
			for(var i = 0; i < files.files.length;i++){
				fs.renameSync(files.files[i].path, form.uploadDir + files.files[i].name);  //重命名
			}
		}else{
			//对单一文件进行重命名
			fs.renameSync(files.files.path, form.uploadDir + files.files.name);  //重命名
		}
		data.school_img_num = files.files.length || 1;
	});
	form.on('end', function() {
		data.message = '上传成功，共上传了' + data.school_img_num + '张图片';
		res.json(data);
	});
});

/*
 * 教师图片列表
 * */
router.get('/file_upload/teacher/list',function (req, res) {
	var path = 'public/images/teacher';
	var fileArray = fs.readdirSync(path);
	data.fileArray = [];
	data.page = Number(req.query.page) || 1;

	for(var i = (data.page - 1) * data.limit; i < (data.page) * data.limit; i++ ){
		if(fileArray[i]){
			data.fileArray.push(fileArray[i]);
		}
	}
	data.count = fileArray.length;
	data.forPage = 'file_upload/teacher/list';
	calculatePages(data.count);
	res.render('admin/fileupload/fileupload_teacher_list',data);
});

/*
 * 教师图片删除
 * */
router.get('/file_upload/teacher/list/delete',function (req, res) {
	var name = req.query.filename,
		path = 'public/images/teacher';

	fs.unlink(path + '/' + name, function (err) {
		if(err){
			data.message = err;
			res.render('admin/error',data);
		}else{
			data.message = '删除文件' + name + '成功！';
			data.url = '/admin/file_upload/teacher/list';
			res.render('admin/success',data);
		}
	});
});

/*
* 透明导航列表
* */
router.get('/abroad_transparent',function (req, res) {
	data.page = Number(req.query.page) || 1;
	Abroad_transparent.find().count().then(function (count) {
		calculatePages(count);
		data.forPage = 'abroad_transparent';
		Abroad_transparent.find().sort({Abroad_t_order: 1}).limit(data.limit).skip(data.skip).then(function (rs) {
			data.abroad_transparents = rs;
			res.render('admin/abroad/abroad_transparent',data);
		});
	});
});

/*
* 透明导航添加
* */
router.get('/abroad_transparent/add',function (req, res) {
	res.render('admin/abroad/abroad_transparent_add',data);
});

/*
* 透明导航添加保存
* */
router.post('/abroad_transparent/add',function (req, res) {
    var abroad_t_name = req.body.abroad_t_name,
	    abroad_t_order = Number(req.body.abroad_t_order || 0),
	    abroad_t_content = req.body.abroad_t_content;

    if(!abroad_t_name){
        data.message = '透明导航标题名称不能为空！';
        res.render('admin/error',data);
        return ;
    }

    new Abroad_transparent({
	    Abroad_t_name: abroad_t_name,
	    Abroad_t_order: abroad_t_order,
	    Abroad_t_content: abroad_t_content
    }).save().then(function () {
        data.message = '透明导航保存成功！';
        data.url = '/admin/abroad_transparent';
        res.render('admin/success',data);
    })
});

/*
 * 透明导航修改
 * */
router.get('/abroad_transparent/edit',function (req, res) {
    var id = req.query.id;
    Abroad_transparent.findById(id).then(function (rs) {
        if(!rs){
            data.message = '所有修改的标题不存在！';
            req.render('admin/error',data);
            return ;
        }
        data.abroad_transparent = rs;
	    res.render('admin/abroad/abroad_transparent_edit',data);
    });
});

/*
 * 透明导航修改保存
 * */
router.post('/abroad_transparent/edit',function (req, res) {
    var id = req.query.id,
	    abroad_t_name = req.body.abroad_t_name,
	    abroad_t_order = Number(req.body.abroad_t_order || 0),
	    abroad_t_content = req.body.abroad_t_content;

	if(!abroad_t_name){
		data.message = '透明导航标题名称不能为空！';
		res.render('admin/error',data);
		return ;
	}

	Abroad_transparent.findOne({_id:{$ne:id},Abroad_t_name:abroad_t_name}).then(function (rs) {
        if(rs){
	        data.message = '透明导航标题名称不能为重复！';
	        res.render('admin/error',data);
	        return Promise.reject();
        }
        Abroad_transparent.update({_id: id},{
	        Abroad_t_name: abroad_t_name,
	        Abroad_t_order: abroad_t_order,
	        Abroad_t_content: abroad_t_content
        }).then(function () {
	        data.message = '透明导航修改成功！';
	        data.url = '/admin/abroad_transparent';
	        res.render('admin/success',data);
        });
	});
});

/*
 * 透明导航删除
 * */
router.get('/abroad_transparent/delete',function (req, res) {
    var id = req.query.id;
    Abroad_transparent.findById(id).then(function (rs) {
        if(!rs){
	        data.message = '要删除的标题不存在！';
	        res.render('admin/error',data);
	        return ;
        }
        Abroad_transparent.remove({_id:id}).then(function () {
	        data.message = '透明导航删除成功！';
	        data.url = '/admin/abroad_transparent';
	        res.render('admin/success',data);
        });
    });
});

/*
* 透明标题内容列表
* */
router.get('/abroad_transparent/content',function (req, res) {
	data.page = Number(req.query.page) || 1;
	Abroad_t_title.find().count().then(function (count) {
		calculatePages(count);
		data.forPage = 'abroad_transparent/content';
		Abroad_t_title.find().sort({abroad_transparent: 1,Abroad_t_title_order: 1}).limit(data.limit).skip(data.skip).populate('abroad_transparent').then(function (rs) {
			data.abroad_t_titles = rs;
			res.render('admin/abroad/abroad_transparent_title',data);
		});
	});
});

/*
* 透明标题内容添加
* */
router.get('/abroad_transparent/content/add',function (req, res) {
    Abroad_transparent.find().sort({Abroad_t_order: 1}).then(function (rs) {
        data.abroad_transparents = rs;
	    res.render('admin/abroad/abroad_transparent_title_add',data);
    });
});

/*
 * 透明标题内容添加保存
 * */
router.post('/abroad_transparent/content/add',function (req, res) {
    var abroad_transparent = req.body.abroad_transparent,
	    abroad_t_title = req.body.abroad_t_title,
	    abroad_t_title_order = Number(req.body.abroad_t_title_order || 0),
	    abroad_t_title_content = req.body.abroad_t_title_content;

    if(!abroad_transparent){
	    data.message = '导航标题不能为空！';
	    res.render('admin/error',data);
	    return ;
    }

    if(!abroad_t_title){
	    data.message = '内容标题名称不能为空！';
	    res.render('admin/error',data);
	    return ;
    }

    new Abroad_t_title({
	    abroad_transparent: abroad_transparent,
	    Abroad_t_title: abroad_t_title,
	    Abroad_t_title_order: abroad_t_title_order,
	    Abroad_t_title_content: abroad_t_title_content
    }).save().then(function () {
	    data.message = '标题内容添加成功！';
	    data.url = '/admin/abroad_transparent/content';
	    res.render('admin/success',data);
    })
});

/*
 * 透明标题内容修改
 * */
router.get('/abroad_transparent/content/edit',function (req, res) {
    var id = req.query.id;

    Abroad_t_title.findById(id).populate('abroad_transparent').then(function (rs) {
        if(!rs){
	        data.message = '要修改的内容标题名称不存在！';
	        res.render('admin/error',data);
	        return ;
        }
        data.abroad_t_title = rs;
        Abroad_transparent.find().sort({Abroad_t_order: 1}).then(function (rs) {
            data.abroad_transparents = rs;
	        res.render('admin/abroad/abroad_transparent_title_edit',data);
        });
    });
});

/*
* 透明标题内容修改保存
* */
router.post('/abroad_transparent/content/edit',function (req, res) {
    var id = req.query.id,
	    abroad_transparent = req.body.abroad_transparent,
	    abroad_t_title = req.body.abroad_t_title,
	    abroad_t_title_order = Number(req.body.abroad_t_title_order || 0),
	    abroad_t_title_content = req.body.abroad_t_title_content;

    if(!abroad_transparent || !abroad_t_title){
	    data.message = '标题或者内容标题名称不能为空！';
	    res.render('admin/error',data);
	    return ;
    }
    Abroad_t_title.findOne({
        abroad_transparent: abroad_transparent,
	    Abroad_t_title: abroad_t_title,
        _id: {$ne: id}
    }).then(function (rs) {
        if(rs){
	        data.message = '内容标题名称不能重复！';
	        res.render('admin/error',data);
	        return Promise.reject();
        }
        Abroad_t_title.update({
            _id: id
        },{
	        Abroad_transparent: abroad_transparent,
	        Abroad_t_title: abroad_t_title,
	        Abroad_t_title_order: abroad_t_title_order,
	        Abroad_t_title_content: abroad_t_title_content
        }).then(function () {
	        data.message = '标题内容修改成功！';
	        data.url = '/admin/abroad_transparent/content';
	        res.render('admin/success',data);
        });
    });
});

/*
* 透明标题删除
* */
router.get('/abroad_transparent/content/delete',function (req, res) {
	var id = req.query.id;
	Abroad_t_title.findById(id).then(function (rs) {
		if(!rs){
			data.message = '要删除的内容标题不存在！';
			res.render('admin/error',data);
			return ;
		}
		Abroad_t_title.remove({_id:id}).then(function () {
			data.message = '内容标题删除成功！';
			data.url = '/admin/abroad_transparent/content';
			res.render('admin/success',data);
		});
	});
});

/*
* 获取留言列表
* */
router.get('/leave_message',function (req, res) {

	data.page = Number(req.query.page) || 1;
	//获取数据库中的条数
	Leave_message.count().then(function (count) {
		calculatePages(count);
		Leave_message.find().sort({_id:-1}).limit(data.limit).skip(data.skip).then(function (rs) {
			data.forPage = 'leave_message';
			data.leave_messages = rs;
			res.render('admin/leave_message/leave_message_index', data);
		});
	});

});

/*
* 查看留言
* */
router.get('/leave_message/check',function (req, res) {
    var id = req.query.id;
    Leave_message.findById(id).then(function (rs) {
        if(!rs){
            data.message = '留言不存在！';
            res.render('admin/error',data);
            return ;
        }
        data.leave_message = rs;
        res.render('admin/leave_message/leave_message_check',data);
    })
});

/*
* 删除留言
* */
router.get('/leave_message/delete',function (req, res) {
   var id = req.query.id;
   Leave_message.findById(id).then(function (rs) {
	   if(!rs){
		   data.message = '所要删除的留言不存在！';
		   res.render('admin/error',data);
		   return ;
	   }
	   Leave_message.remove({
           _id: id
       }).then(function () {
           data.message = '留言删除成功！';
           data.url = '/admin/leave_message';
           res.render('admin/success',data);
	   })

   });

});

//返回出去给app.js
module.exports = router;