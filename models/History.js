import mongoose from "mongoose";

// schema
var historySchema = mongoose.Schema({
	postId: { type: String, required: true },
	editMsg: {type: String},
    title: {type: String, required: [true, 'Title is required!']},
    body: {type: String, required: [true, 'Body is required!']},
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},	// ref: 'user'를 통해 user.id와 post.author를 연결(relationship)
    createdAt: {type: Date, default: Date.now},
	updatedAt: {type: Date, default: Date.now}
});

// model & export
var History = mongoose.model('history', historySchema);
export default History;
// module.exports = History;