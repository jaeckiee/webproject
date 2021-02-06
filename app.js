import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import flash from "connect-flash";
import session from "express-session";
import passport from "./config/passport.js";
import methodOverride from "method-override";
import homeRouter from "./routes/home.js";
import postRouter from "./routes/posts.js";
import Post from "./models/Post.js";
import Chat from "./models/Chat.js";
import userRouter from "./routes/users.js";
import util from "./util.js";
import moment from "moment-timezone";
//사용자 ip를 가져오기 위한 모듈
import requestIp from "request-ip";
const app = express();
const PORT = 3000;
const http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

http.listen(PORT, function(){ 
	console.log('server on..');
});


//////////////////////////////////////////////////////////////// DB SETTING

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb+srv://captainroh:shwnsdud12@cluster0.lspep.mongodb.net/Cluster0?retryWrites=true&w=majority');//db 연결시 고쳐야 

var db = mongoose.connection;
db.once('open',function(){
	console.log('DB connected');
});
db.on('error',(err) => {
	  console.log('DB ERROR : ', err);
});

//////////////////////////////////////////////////////////////// MIDDLEWARE SETTING

//app.listen(PORT, (req,res) => console.log(`server start`));
app.set("view engine", "pug");
app.use(express.static(__dirname+'/public'));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "100mb" }));	// PayloadTooLargeError 해결
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb", extended: false }));
app.use(helmet());
app.use(morgan("dev"));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next) => {
	res.locals.isAuthenticated = req.isAuthenticated();
	res.locals.currentUser = req.user;
	res.locals.util = util;
	res.locals.Chat = Chat;
	next();
});

var count=1;
io.on('connection',function(socket){
	console.log('user connected: ', socket.id);
	socket.on('disconnect', function(){
		console.log('user disconnected: '+ socket.id + ' ' + socket.name );
	});
	socket.on('send message', function(userId,name,text){
		if(name && text){
			//console.log(userId);
			var msg = name + '(' + socket.handshake.address.substring(7,13) + ')' + ' : ' + text;
			if(userId == undefined){
				var current_chat = {
					username : name,
					comment : text,
					ip : socket.handshake.address
				};
			}
			else{
				var tempname = userId.username;
				var current_chat = {
					userID : tempname,
					username : name,
					comment : text,
					ip : socket.handshake.address
				};
			}
			var current_chat;
			var seouldate,seoultime;
			Chat.create(current_chat,(err,chat) => {
				if(err) res.json(err);
				current_chat = chat;
				seouldate = moment(current_chat.date.getTime()).tz('Asia/Seoul').format("YYYY-MM-DD");
				seoultime = moment(current_chat.date.getTime()).tz('Asia/Seoul').format("HH:mm");
				io.to(socket.id).emit('receive my message',msg,seouldate,seoultime);
				socket.broadcast.emit('receive other message',msg,seouldate,seoultime);
			});
			/*
			if(userId == undefined){
				io.emit('receive other message',msg);
			}
			else{
				if(current_chat.userID == userId.username){
					io.to(socket.id).emit('receive my message',msg);
					socket.broadcast.emit('receive other message',msg);
				}
				else{
					io.emit('receive other message',msg);
				}	
			}
			*/
		}
		else{
			var msg = '이름이나 메세지를 비우지 마세요.';
			console.log(msg);
			io.to(socket.id).emit('undefined',msg);
		}
	});
	socket.on('chat load',function(userId){
		Chat.find({})
		.limit(100)
		.sort('date')
		.exec(function(err,chats){
			if(err) console.log("에러on");
			for(var i in chats){
				var seouldate = moment(chats[i].date.getTime()).tz('Asia/Seoul').format("YYYY-MM-DD");
				var seoultime = moment(chats[i].date.getTime()).tz('Asia/Seoul').format("HH:mm");
				var msg = chats[i].username + '(' + ((chats[i].ip != undefined)?chats[i].ip.substring(7,13):"") + ')' + ' : ' + chats[i].comment;
				if(userId == undefined){
					//로그인 안한 경우
					io.to(socket.id).emit('receive other message',msg,seouldate,seoultime);
				}
				else{
					//로그인 한 경우 id가 일치한지 따라 나누기.
					if(chats[i].userID == userId.username){
						io.to(socket.id).emit('receive my message',msg,seouldate,seoultime);	
					}
					else{
						io.to(socket.id).emit('receive other message',msg,seouldate,seoultime);
					}	
				}
			}
		});
	});
	
});

app.get("/chat",function(req,res,next){
	console.log(req.user);
	res.json(req.user);
});
app.use(function(req, res, next){
	Post.find({})
	.limit(10)
	.sort('-updatedAt')
	.exec(function(err, asides){
		if (err) return res.json(err);
		res.locals.asides=asides;
		res.locals.datenow=new Date();
		res.locals.moment=moment;
		next();
	});
});
app.use("/", homeRouter);
app.use("/posts", util.getPostQueryString, postRouter);
app.use("/users", userRouter);

export default app;
