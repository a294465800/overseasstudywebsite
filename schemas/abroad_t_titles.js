/**
 * Created by SHINING on 2017/3/28.
 */

//用户数据库
var mongoose = require('mongoose');

//导航内容的表结构
module.exports = new mongoose.Schema({

    //关联字段
    abroad_transparent:{
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Abroad_transparent'
    },

    //导航内容标题
    Abroad_t_title: String,
	Abroad_t_title_order: {
        type: Number,
        default: 0
    },
	Abroad_t_title_content: String,
	Abroad_t_title_hot: {
    	type: Number,
		default: 0
	}
});