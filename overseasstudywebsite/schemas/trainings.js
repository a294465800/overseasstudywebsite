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

    //培训分类名称
    Training_name: String,
    Training_url: {
        type: String,
        default: '/'
    },
    Training_order: {
        type: Number,
        default: 0
    },
    Training_count:{
        type: Number,
        default: 0
    }
});