/**
 * Created by SHINING on 2017/3/19.
 */

var mongoose = require('mongoose');
var leave_messagesSchema = require('../schemas/leave_messages');

module.exports = mongoose.model('Leave_message',leave_messagesSchema);