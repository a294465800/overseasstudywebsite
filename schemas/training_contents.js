/**
 * Created by SHINING on 2017/3/28.
 */

//用户数据库
var mongoose = require('mongoose');

//导航内容的表结构
module.exports = new mongoose.Schema({

    //关联字段
    test:{
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Test'
    },

    training:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Training'
    },

    //文章标题名称
    Training_content_name: String,
    Training_content_order: {
        type: Number,
        default: 10
    },
    Training_content_url: {
        type: String,
        default: '/'
    },
    Training_content_markdown: String
});