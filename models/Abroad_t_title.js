/**
 * Created by SHINING on 2017/3/28.
 */

var mongoose = require('mongoose');
var abroad_t_titlesSchema = require('../schemas/abroad_t_titles');

module.exports = mongoose.model('Abroad_t_title',abroad_t_titlesSchema);