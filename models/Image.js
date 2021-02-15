import mongoose from "mongoose";

// schema
var imageSchema = mongoose.Schema({
	src: {type: String, required: true },
	postId: { type: String, required: true },
	idx: {type: String, required: true }
});

// model & export
var Image = mongoose.model('image', imageSchema);

export default Image;
// module.exports = Image;