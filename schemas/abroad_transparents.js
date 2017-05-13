/**
 * Created by SHINING on 2017/3/28.
 */

//用户数据库
var mongoose = require('mongoose');

//分类的表结构
module.exports = new mongoose.Schema({

    Abroad_t_name:String,

    Abroad_t_order: {
        type: Number,
        default: 0
    },

    Abroad_t_content: String
});