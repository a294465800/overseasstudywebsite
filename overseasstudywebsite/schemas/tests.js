/**
 * Created by SHINING on 2017/3/28.
 */

//用户数据库
var mongoose = require('mongoose');

//分类的表结构
module.exports = new mongoose.Schema({

    //考试名称
    Test_name:String,
    //考试顺序
    Test_order:{
        type: Number,
        default: 0
    },
    Test_url:{
        type: String,
        default: '/'
    },
    Test_count:{
        type:Number,
        default: 0
    }
});