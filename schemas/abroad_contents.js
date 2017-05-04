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

    abroad_nav:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Abroad_nav'
    },

    //文章标题名称
    Abroad_content_name: String,
    Abroad_content_order: {
        type: Number,
        default: 10
    },
    Abroad_content_url: {
        type: String,
        default: '/'
    },
    Abroad_content_markdown: String,
    Abroad_content_hot: {
        type: Number,
        default: 0
    }
});