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

    school:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    },

    test1:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
    },

    test2:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
    },
    //文章标题名称
    Abroad_enroll_name: {
        type: String,
        default: '文章标题为空'
    },
    //学生成绩
    Abroad_enroll_score1: {
        type: Number,
        default: 0
    },
    Abroad_enroll_score2: {
        type: Number,
        default: 0
    },
    //录取专业
    Abroad_enroll_subject: String,
    //学生姓名
    Abroad_enroll_student: String,
    Abroad_enroll_code: String,
    Abroad_enroll_order: {
        type: Number,
        default: 10
    },
    Abroad_enroll_url: {
        type: String,
        default: '/'
    }
});