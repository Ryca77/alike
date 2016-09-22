var mongoose = require('mongoose');

var LikeSchema = new mongoose.Schema({
    mediaId: { type: String, required: true },
    userId: {type: String, required: true }
});

var Like = mongoose.model('Like', LikeSchema);

module.exports = Like;