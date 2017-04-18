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
    Abroad = require('../models/Abroad'),
    Abroad_nav = require('../models/Abroad_nav'),
    Abroad_content = require('../models/Abroad_content'),
    Abroad_enroll = require('../models/Abroad_enroll'),
    Test = require('../models/Test'),
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
    var arr = [],
        a = sum;
    for(var i = 0;i<5;i++){
        arr[i] = a;
        a--;
    }
    return arr.reverse();
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
* 处理通用数据，用于前台展示的数据
* */
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
        limit: 20       //每页显示的数量
    };
    Navigation.find().sort({Nav_order:1}).then(function (navigations) {
        data.navigations =navigations;
    }).then(function () {
        return Nav_title.find().populate('navigation').sort({navigation:1,Nav_title_order:1});
    }).then(function (rs) {
        data.nav_titles =rs;
    }).then(function () {
        return Nav_content.find().populate(['navigation','nav_title']).sort({navigation:1,nav_title:1,Nav_content_order:1});
    }).then(function (rs) {
        data.nav_contents = rs;
    }).then(function () {
        return Abroad.find().sort({_id:-1});
    }).then(function (rs) {
        data.abroads = rs;
    }).then(function () {
        return Abroad_nav.find().populate('abroad').sort({abroad:-1,Abroad_nav_order:1});
    }).then(function (rs) {
        data.abroad_navs = rs;
    }).then(function () {
        return Abroad_content.find({Abroad_content_order:{$lt:8}}).populate(['abroad','abroad_nav']).sort({abroad:-1,abroad_nav:-1,Abroad_content_order:1});
    }).then(function (rs) {
        data.abroad_contents = rs;
    }).then(function () {
        return Abroad_enroll.find({Abroad_enroll_order:{$lt:5}}).populate(['abroad','school','test1','test2']).sort({abroad:1,_id:-1});
    }).then(function (rs) {
        data.abroad_enrolls =rs;
    }).then(function () {
        return Test.find().sort({Test_order:1});
    }).then(function (rs) {
        data.tests = rs;
        next();
    });
});

/*
* 首页
* */
router.get('/',function (req, res) {
    School.find().sort({School_love: -1}).limit(6).then(function (rs) {
        data.hot_schools = rs;
        res.render('main/index',data);
    });
});

/*
* 首页学校搜索
* */
router.post('/',function (req, res) {
    var school_name = req.body.school_name || '';
    data.page = Number(req.query.page || 1);

    if(school_name){
        School.find({School_zn:school_name}).count().then(function (count) {

            data.count = count;
            //计算总页数
            data.pages = Math.ceil(count / data.limit);
            data.pagesFont = setArrFont(data.pages);
            data.pagesEnd  = setArrEnd(data.pages);
            //取值不能超过pages
            data.page = Math.min(data.page, data.pages);

            //取值不能小于1
            data.page = Math.max(data.page, 1);

            data.skip = (data.page - 1) * data.limit;
            School.find({School_zn:school_name}).populate('area').limit(data.limit).skip(data.skip).then(function (rs) {
                data.schools = rs;
                res.render('main/school_index',data);
            });
        });
    }else{
        School.find().count().then(function (count) {

            data.count = count;
            //计算总页数
            data.pages = Math.ceil(count / data.limit);
            data.pagesFont = setArrFont(data.pages);
            data.pagesEnd  = setArrEnd(data.pages);
            //取值不能超过pages
            data.page = Math.min(data.page, data.pages);

            //取值不能小于1
            data.page = Math.max(data.page, 1);

            data.skip = (data.page - 1) * data.limit;

            School.find().populate('area').limit(data.limit).skip(data.skip).then(function (rs) {
                data.schools = rs;
                res.render('main/school_index',data);
            });
        });
    }
});

/*
* 全部学校
* */
router.get('/school',function (req, res) {
    var area = req.query.school_area || '',
        call = Number(req.query.call) || 0,
        call2 = Number(req.query.call2) || 0,
        rank = Number(req.query.school_rank) || 0,
        a = 0,
        b = 0;
    data.page = Number(req.query.page || 1);
    data.area = area;
    data.call = call;
    data.call2 = call2;
    data.rank = rank;

    switch(rank){
        case 0:
            break;
        case 1: a = 1;b = 10;
                break;
        case 2: a = 10;b = 20;
                break;
        case 3: a = 20;b = 50;
                break;
        case 4: a = 50;b = 100;
                break;
        case 5: a = 100;b = 150;
                break;
        case 6: a = 150;b = 9999;
                break;
    }

    if(area && !rank){
        //当有区域没有排名的时候
        Area.findOne({Area_name:area}).then(function (rs) {
            School.find({area:rs._id}).count().then(function (count) {
                calculatePages(count);
                School.find({area:rs._id}).populate('area').sort({School_rank:1}).limit(data.limit).skip(data.skip).then(function (rs) {
                    data.schools = rs;
                    res.render('main/school_index',data);
                });
            });
        });
    }else if(area && rank){
        //当有区域有排名的时候
        Area.findOne({Area_name:area}).then(function (rs) {
            School.find({area:rs._id,School_rank:{$gte:a,$lte:b}}).count().then(function (count) {
                calculatePages(count);
                School.find({area:rs._id,School_rank:{$gte:a,$lte:b}}).populate('area').sort({School_rank:1}).limit(data.limit).skip(data.skip).then(function (rs) {
                    data.schools = rs;
                    res.render('main/school_index',data);
                });
            });
        });
    }else if(!area && rank){
        //当没区域有排名的时候
        School.find({School_rank:{$gte:a,$lte:b}}).count().then(function (count) {
            calculatePages(count);
            School.find({School_rank:{$gte:a,$lte:b}}).populate('area').sort({School_rank:1}).limit(data.limit).skip(data.skip).then(function (rs) {
                data.schools = rs;
                res.render('main/school_index',data);
            });
        });
    }else{
        School.find().count().then(function (count) {
            calculatePages(count);
            School.find().populate('area').limit(data.limit).skip(data.skip).then(function (rs) {
                data.schools = rs;
                res.render('main/school_index',data);
            });
        });
    }
});

/*
* 学校页面的搜索
* */
router.post('/school',function (req, res) {
    var school_name = req.body.school_name || '';
    data.page = Number(req.query.page || 1);

    if(school_name){
        School.find({School_zn:school_name}).count().then(function (count) {
            calculatePages(count);
            School.find({School_zn:school_name}).populate('area').limit(data.limit).skip(data.skip).then(function (rs) {
                data.schools = rs;
                res.render('main/school_index',data);
            });
        });
    }else{
        School.find().count().then(function (count) {
            calculatePages(count);
            School.find().populate('area').limit(data.limit).skip(data.skip).then(function (rs) {
                data.schools = rs;
                res.render('main/school_index',data);
            });
        });
    }

});

/*
* 首页本科
* */
router.get('/undergraduate',function (req, res) {
    res.render('main/undergraduate_index',data);
});

//返回出去给app.js
module.exports = router;