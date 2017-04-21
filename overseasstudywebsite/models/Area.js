/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var areasSchema = require('../schemas/areas');

module.exports = mongoose.model('Area',areasSchema);