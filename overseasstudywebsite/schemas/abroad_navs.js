/**
 * Created by SHINING on 2017/3/28.
 */

//用户数据库
var mongoose = require('mongoose');

//导航内容的表结构
module.exports = new mongoose.Schema({

    //关联字段
    abroad:{
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Abroad'
    },

    //导航内容标题
    Abroad_nav_name: String,
    Abroad_nav_url: {
        type: String,
        default: '/'
    },
    Abroad_nav_order: {
        type: Number,
        default: 0
    },
    Abroad_nav_count:{
        type: Number,
        default: 0
    }
});