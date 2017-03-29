/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var navigationsSchema = require('../schemas/navigations');

module.exports = mongoose.model('Navigation',navigationsSchema);