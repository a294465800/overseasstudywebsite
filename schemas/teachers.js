/**
 * Created by SHINING on 2017/3/28.
 */

//用户数据库
var mongoose = require('mongoose');

//分类的表结构
module.exports = new mongoose.Schema({

    //教师名称
    Teacher_name:String,
    //教师简介
    Teacher_intro: String,
    //教师顺序
    Teacher_order:{
        type: Number,
        default: 0
    },
    Teacher_img: String,
    Test_url:{
        type: String,
        default: '/'
    },
    Teacher_background: String
});