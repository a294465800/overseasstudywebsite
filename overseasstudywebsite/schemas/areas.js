/**
 * Created by SHINING on 2017/3/28.
 */

//用户数据库
var mongoose = require('mongoose');

//分类的表结构
module.exports = new mongoose.Schema({

    //地区名
    Area_name:String,
    //地区顺序
    Area_order:{
        type: Number,
        default: 0
    },
    //地区学校数
    Area_count:{
        type:Number,
        default:0
    }
});