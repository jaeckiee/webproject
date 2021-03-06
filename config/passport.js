import passport from "passport";
import User from "../models/User.js";

import PassportLocal from "passport-local";
import PassportNaver from "passport-naver";
var LocalStrategy = PassportLocal.Strategy;
var NaverStrategy = PassportNaver.Strategy;
// var LocalStrategy = require('passport-local').Strategy;
// var NaverStrategy = require('passport-naver').Strategy;

passport.serializeUser((user,done) => {
	console.log('passport session save:', user);
	done(null,user.id);
});
passport.deserializeUser((id,done) => {
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
	clientID: "N_oyYPyV2ByoW35pUP1F",
	clientSecret: "NPzMLHo1oQ",
	callbackURL: "https://eightwiki.herokuapp.com/login/naver/callback"
},	
	(accessToken, refreshToken, profile,done) => {
		console.log(profile);
		var finduser = {
			id : profile.id,
			email: profile.emails[0].value
		}
		User.findOne({email:finduser.email}).exec((err,user) => {
			if(user){
				return done(null,user);
			}
			else{
				return done(null,false,{message:'등록된 정보가 없어 회원가입이 필요합니다.'});
			}
		});
	}
							  )
			);
export default passport;