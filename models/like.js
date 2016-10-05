var mongoose = require('mongoose');

var LikeSchema = new mongoose.Schema({
    media_id: {type: String, required: true},
    user_id: {type: String, required: true}
});

var Like = mongoose.model('Like', LikeSchema);

module.exports = Like;