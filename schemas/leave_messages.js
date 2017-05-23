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
    name:String,
    //电话号码
    tel:String,
    //留言信息
    leave_message: String

});
