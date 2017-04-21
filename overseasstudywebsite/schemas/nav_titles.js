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

    //导航内容标题
    Nav_title: String,
    Nav_title_order: {
        type: Number,
        default: 0
    },
    Nav_title_count:{
        type: Number,
        default: 0
    }
});