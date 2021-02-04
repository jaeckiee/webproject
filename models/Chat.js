import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
	userID : {
		type : String,
		default : ''
	},
	username : {
		type : String
	},
	comment : {
		type : String
	},
	date : {
		type:Date,
		default:Date.now
	},
	ip : {
		type : String
	}
});
var Chat = mongoose.model('Chat',chatSchema);
export default Chat;