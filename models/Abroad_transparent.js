/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var abroad_transparentsSchema = require('../schemas/abroad_transparents');

module.exports = mongoose.model('Abroad_transparent',abroad_transparentsSchema);