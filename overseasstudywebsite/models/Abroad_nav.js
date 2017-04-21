/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var abroad_navsSchema = require('../schemas/abroad_navs');

module.exports = mongoose.model('Abroad_nav',abroad_navsSchema);