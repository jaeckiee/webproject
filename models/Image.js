var mongoose = require('mongoose');

// schema
var imageSchema = mongoose.Schema({
	src: {type: String, required: true },
	postId: { type: String, required: true },
	idx: {type: String, required: true }
});

// model & export
var Image = mongoose.model('image', imageSchema);

module.exports = Image;