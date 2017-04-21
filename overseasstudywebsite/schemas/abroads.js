/**
 * Created by SHINING on 2017/3/28.
 */

//用户数据库
var mongoose = require('mongoose');

//分类的表结构
module.exports = new mongoose.Schema({

    //留学名称
    Abroad_name:String,
    //留学导航数
    Abroad_count:{
        type:Number,
        default:0
    }
});