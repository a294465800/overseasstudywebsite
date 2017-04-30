/**
 * Created by SHINING on 2017/3/19.
 */

var mongoose = require('mongoose');
var teachersSchema = require('../schemas/teachers');

module.exports = mongoose.model('Teacher',teachersSchema);