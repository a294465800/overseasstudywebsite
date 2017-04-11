/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var abroadsSchema = require('../schemas/abroads');

module.exports = mongoose.model('Abroad',abroadsSchema);