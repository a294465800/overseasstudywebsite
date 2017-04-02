/**
 * Created by SHINING on 2017/3/28.
 */

//用户数据库
var mongoose = require('mongoose');

//分类的表结构
module.exports = new mongoose.Schema({

    //关联字段,地区
    area:{
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Area'
    },
    //学校名
    School_zn:String,
    School_en:String,

    //导航顺序
    School_rank:{
        type: Number,
        default: 0
    },

    //学校图片名称
    School_url: String,

    //点赞数
    School_love:{
        type:Number,
        default:0
    }
});