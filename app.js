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
import userRouter from "./routes/users.js";

const app = express();
const PORT = 3000;

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
//setting
app.listen(PORT, (req,res) => console.log(`server start`));
app.set("view engine", "pug");
app.use(express.static(__dirname+'/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true}));
app.use(helmet());
app.use(morgan("dev"));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next) => {
	res.locals.isAuthnticated = req.isAuthenticated();
	res.locals.currentUser = req.user;
	next();
});

app.use("/",homeRouter);
app.use("/posts", postRouter);
app.use("/users", userRouter);

export default app;