/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var nav_titlesSchema = require('../schemas/nav_contents');

module.exports = mongoose.model('Nav_content',nav_titlesSchema);