/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var trainingsSchema = require('../schemas/trainings');

module.exports = mongoose.model('Training',trainingsSchema);