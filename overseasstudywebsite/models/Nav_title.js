/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var nav_titlesSchema = require('../schemas/nav_titles');

module.exports = mongoose.model('Nav_title',nav_titlesSchema);