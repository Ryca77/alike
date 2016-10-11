var mongoose = require('mongoose');

var ChatSchema = new mongoose.Schema({
    user_id_sender: {type: String, required: true},
    user_pic_sender: {type: String, required: true},
    user_bio_sender: {type: String, required: true},
    user_id_receiver: {type: String, required: true},
    intro_message: {type: String, required: true},
    message: {type: String, required: false},
    time_stamp: {type: String, required: true}
});

var Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;