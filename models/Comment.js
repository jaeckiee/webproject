// models/Comment.js

var mongoose = require('mongoose');

// schema
var commentSchema = mongoose.Schema({
  post:{type:mongoose.Schema.Types.ObjectId, ref:'post', required:true},   // 1
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true}, // 1
  authorname:{type:String, ref:'user', required:true},
  text:{type:String, required:[true,'text is required!']},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
},{
  toObject:{virtuals:true}
});


// model & export
var Comment = mongoose.model('comment',commentSchema);
module.exports = Comment;