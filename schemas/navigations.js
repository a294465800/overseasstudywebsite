/**
 * Created by SHINING on 2017/3/28.
 */

//用户数据库
var mongoose = require('mongoose');

//分类的表结构
module.exports = new mongoose.Schema({

    //分类名
    Nav_name:String,
    //导航顺序
    Nav_order:{
        type: Number,
        default: 0
    },
    Nav_url: String
});