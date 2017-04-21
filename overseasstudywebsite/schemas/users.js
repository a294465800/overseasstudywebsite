/**
 * Created by SHINING on 2017/3/19.
 */

/*
* 用户信息数据库
* */

//用户数据库
var mongoose = require('mongoose');

//用户的表结构
module.exports = new mongoose.Schema({

    //用户名
    username:String,
    //密码
    password:String,
    //是否是管理员
    isAdmin:{
        type: Boolean,
        default: false
    }   //管理员最好不要记录在cookies中，否则以后可能会有漏洞

});
