var mongoose = require('mongoose');
var Counter = require('./Counter');

// schema
var postSchema = mongoose.Schema({
    title: {type: String, required: [true, 'Title is required!']},
    body: {type: String, required: [true, 'Body is required!']},
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},	// ref: 'user'를 통해 user.id와 post.author를 연결(relationship)
	// views: {type: Number, default: 0},		// 조회수
	// numId: {type: Number},					// 글번호
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date},
});

// pre: 첫 번째 파라미터 ('save')함수가 발생하기 전에 callback을 실행.
// js 비동기 처리에서 서순 보장을 위해 async await을 사용함(함수에 콜백이나 Promise 객체를 이용하기는 귀찮음)
// posts counter를 읽어와 처리하며, 없을 경우 생성함.
// postSchema.pre('save', async function (next) {
// 	var post = this;
// 	if (post.isNew) {
// 		counter = await Counter.findOne({name: 'posts'}).exec();
// 		if (!counter) counter = await Counter.create({name: 'posts'});	// 
// 		counter.count++;
// 		counter.save();
// 		post.numId = counter.count;
// 	}
// 	return next();
// });

// model & export
var Post = mongoose.model('post', postSchema);
module.exports = Post;
