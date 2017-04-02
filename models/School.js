/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var schoolsSchema = require('../schemas/schools');

module.exports = mongoose.model('School',schoolsSchema);