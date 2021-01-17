import passport from "passport";
import User from "../models/User.js";

var LocalStrategy = require('passport-local').Strategy;
var NaverStrategy = require('passport-naver').Strategy;

passport.serializeUser((user,done) => {
	console.log('passport session save:', user);
	done(null,user.id);
});
passport.deserializeUser((id,done) => {
	console.log("passport session get id : ", id);
	User.findOne({_id:id}, (err,user) => {
		done(err,user);
	});
});

passport.use('local-login',
  new LocalStrategy({
      usernameField : 'username', // 3-1
      passwordField : 'password', // 3-1
      passReqToCallback : true
    },
    (req, username, password, done) => { // 3-2
      User.findOne({username:username})
        .select({password:1})
        .exec(function(err, user) {
          if (err) return done(err);

          if (user && user.authenticate(password)){ // 3-3
            return done(null, user);
          }
          else {
            req.flash('username', username);
            req.flash('errors', {login:'The username or password is incorrect.'});
            return done(null, false);
          }
        });
    }
  )
);

passport.use('naver-login',
			 new NaverStrategy({
	clientID: "S6gHT3hjx63FrfWdmFjL",
	clientSecret: "_wMP5Tu6eu",
	callbackURL: "https://webproject-kmllh.run.goorm.io/login/naver/callback"
},	
	(accessToken, refreshToken, profile,done) => {
		var finduser = {
			id : profile.id,
			email: profile.emails[0].value
		}
		User.findOne({email:finduser.email}).exec((err,user) => {
			if(user){
				return done(null,user);
			}
			else{
				return done(null,false);
			}
		});
	}
							  )
			);
export default passport;