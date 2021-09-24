const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const options = {discriminatorKey: 'kind'};

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    nom:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required:true,
        unique:[true, 'there is another account with this email'],
        validate: [validator.isEmail, 'you must enter a valid email']
    },
    isAdmin:{
        type: Boolean,
        default: false,
    },
    password:{
        type:String,
        required:[true,'you must enter the password'],
        select: false
    },
    passwordConfirm:{
        type:String,
        required:[true,'you must enter the password confirm field'],
    },
    active:{
        type: Boolean,
        default: false
    },
    tel:{
        type: String,
        required: true
    },
    Bio: {
        type: String
    },
    passwordChangedAt: Date,
    passwordToken: String,
    passwordTokenExpire: Date,
    activeToken: String,
    activeTokenExpire: Date,
    newEmailToken: String,
    newEmailTokenExpire: Date,
    newEmail: String 
}, options);

var studentSchema = new mongoose.Schema({
    cv: String,
    status: {
        type: String,
        required: true,
        enum: ['Student', 'Fresh graduate']
    },
    niveau: {
        type: String,
        required: true
    },
    etablissement: {
        type: String,
        required: true
    },
    domaine: {
        type: String,
        required: true
    },
    picture:{
        type:String,
        default: 'https://res.cloudinary.com/ddu6qxlpy/image/upload/v1627168233/iafh6yj3q0bdpthswtu3.jpg'
    }
})

var companySchema = new mongoose.Schema({
    lieu: String,
    taille: String,
    domaine: [String],
    picture:{
        type:String,
        default: 'https://res.cloudinary.com/ddu6qxlpy/image/upload/v1627168233/iafh6yj3q0bdpthswtu3.jpg'
    },
})

// CHECK IF PASSWORD CONFIRM IS THE SAME WITH PASSWORD
userSchema.path('passwordConfirm').validate(function(el) {
    return el === this.password
},'Passwords are not the same')
// PRE MIDDLEWARE FOR CRYPTYNG PASS BEFORE SAVE IT
userSchema.pre('save', async function(next){
    // if we modifie other data , is not neccesary to crypt the password again
    if(!this.isModified('password')) return next(); 
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
})
// PRE MIDDLEWARE FOR ADD PASSWORDCHANGEDAT IN CASE OF UPDATYNG PASS
userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
})
// INSTENSE METHOD FOR CHECK IF PASS IS CORRECT (I USE IT IN LOGIN CONTROLLER)
userSchema.methods.checkPassword = async (realPass, userPass)=>{
    return await bcrypt.compare(userPass, realPass)
}
// CHECK IF PASSWORD CHANGED AFTER THE TOKEN ISSUED
userSchema.methods.passwordChangedAfter = function(JWTiat){
    if(this.passwordChangedAt){
        const userpaswordchangedat = parseInt(this.passwordChangedAt.getTime() / 1000,10);
        return userpaswordchangedat > JWTiat;
    }
    return false;
}
// INSTENSE METHOD TO GENERATE A RANDOM TOKEN (I USE IT IN FORGETPASSWORD CONTROLLER)
userSchema.methods.generateRandomPassToken = function(){
    // create randome hexdicimal string
    const resetToken = crypto.randomBytes(32).toString('hex');

    // cryptded resetToken to store it to database (we should not store sensative data in crybted form)
    this.passwordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordTokenExpire = Date.now() + 10*60*1000; // will expired after 10 min
    return resetToken
}
// INSTENSE METHOD TO GENERATE A RANDOM TOKEN (I USE IT IN SINGUP CONTROLLER)
userSchema.methods.generateRandomEmailToken = function(){
    // create randome hexdicimal string
  const randomToken = crypto.randomBytes(30).toString('hex');

  this.activeToken = randomToken;
  this.activeTokenExpire = Date.now() + 10*60*1000; // will expired after 10 min
  return randomToken
}
// INSTENSE METHOD TO GENERATE A RANDOM TOKEN (I USE IT IN UPDATE EMAIL CONTROLLER)
userSchema.methods.generateRandomNewEmailToken = function(){
    // create randome hexdicimal string
  const randomToken = crypto.randomBytes(30).toString('hex');

  this.newEmailToken = randomToken;
  this.newEmailTokenExpire = Date.now() + 10*60*1000; // will expired after 10 min
  return randomToken
}


const User = mongoose.model('User', userSchema);

const Student = User.discriminator('Student', studentSchema, options);

const Company = User.discriminator('Company', companySchema, options);



module.exports = {
    User,
    Student,
    Company
}