/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var abroad_enrollsSchema = require('../schemas/abroad_enrolls');

module.exports = mongoose.model('Abroad_enroll',abroad_enrollsSchema);