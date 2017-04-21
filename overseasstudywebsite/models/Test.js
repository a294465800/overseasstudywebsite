/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var testsSchema = require('../schemas/tests');

module.exports = mongoose.model('Test',testsSchema);