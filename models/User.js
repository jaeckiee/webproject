import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = mongoose.Schema({
	username: {
		type : String,
		required: [true,'Username is required!'],
		match: [/^.{4,12}$/, 'Should be 4-12 characters!'],
		trim: true,
		unique: true
	},
	password: {
		type:String,
		required: [true,'Password is required!'],
		select: false
	},
	name: {
		type:String,
		required: [true, 'Name is required'],
		match: [/^.{3,12}$/, 'Should be 3-12 characters!'],
		trim: true,
		unique: true
	},
	email: {
		type:String,
		match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Should be a valid email address!'],
		trim: true
	},
	blacklist: { type: Boolean, default: true },
},{
	toObject:{virtuals:true}
});

userSchema.virtual('passwordConfirmation')
	.get(function(){ return this._passwordConfirmation;})
	.set(function(value){ this._passwordConfirmation=value; });
userSchema.virtual('originalPassword')
	.get(function(){ return this._originalPassword;})
	.set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
	.get(function(){ return this._currentPassword;})
	.set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
	.get(function(){ return this._newPassword;})
	.set(function(value){ this._newPassword=value; });

var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}?/;
var passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!';

userSchema.path('password').validate(function(v) {
	var user = this;
	
	if(user.isNew){
		if(!user.passwordConfirmation){
			user.invalidate('passwordConfirmation','Password Confirmation is required');
		}
		if (!passwordRegex.test(user.password)) {
            user.invalidate('password', passwordRegexErrorMessage);
        }
        else if (user.password !== user.passwordConfirmation) {
            user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
	}
	
	if(!user.isNew){
		if(!user._currentPassword){
			user.invalidate('currentPassword','Current Password is required');
		}
		else if(!bcrypt.compareSync(user.currentPassword , user.originalPassword)){
			user.invalidate('currentPassword','Current Password is invalid');
		}
		if (user.newPassword && !passwordRegex.test(user.newPassword)) {
            user.invalidate('newPassword', passwordRegexErrorMessage);
        }
        else if (user.newPassword !== user.passwordConfirmation) {
            user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
	}
});

userSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){ // 3-1
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password); //3-2
    return next();
  }
});

userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};
const User = mongoose.model('user', userSchema);

export default User;