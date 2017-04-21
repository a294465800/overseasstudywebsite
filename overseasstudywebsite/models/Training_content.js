/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var training_contentsSchema = require('../schemas/training_contents');

module.exports = mongoose.model('Training_content',training_contentsSchema);