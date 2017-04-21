/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var abroad_contentsSchema = require('../schemas/abroad_contents');

module.exports = mongoose.model('Abroad_content',abroad_contentsSchema);