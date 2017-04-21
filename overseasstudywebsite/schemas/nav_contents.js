/**
 * Created by SHINING on 2017/3/28.
 */

//用户数据库
var mongoose = require('mongoose');

//导航内容的表结构
module.exports = new mongoose.Schema({

    //关联字段
    navigation:{
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Navigation'
    },

    nav_title:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Nav_title'
    },

    //标题内容名称
    Nav_content_name: String,
    Nav_content_order: {
        type: Number,
        default: 0
    },
    Nav_content_url: {
        type: String,
        default: '/'
    }
});