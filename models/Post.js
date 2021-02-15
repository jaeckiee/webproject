import mongoose from "mongoose";

// schema
var postSchema = mongoose.Schema({
    title: {type: String, required: [true, 'Title is required!'], unique: true},
    body: {type: String, required: [true, 'Body is required!']},
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},	// ref: 'user'를 통해 user.id와 post.author를 연결(relationship)
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

// model & export
var Post = mongoose.model('post', postSchema);
export default Post;