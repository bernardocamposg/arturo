var bcrypt=require("bcrypt-nodejs");
var mongoose = require("mongoose");

var SALT_FACTOR = 10;

var soldierSchema = mongoose.Schema({
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    role:{type:String,required:true},
    createdAt:{type:Date,default:Date.now},
    displayName:{type:String},
    bio:String
}); 

var donothing= ()=>{

}

soldierSchema.pre("save",function(done){
    var soldier = this;
    if(!soldier.isModified("password")){
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR,(err, salt)=>{
        if(err){
            return done(err);
        }
        bcrypt.hash(soldier.password, salt, donothing,
        (err, hashedpassword)=>{
        if(err){
            return done(err);
        }
        soldier.password = hashedpassword;
        done();
        });
    });
});
soldierSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess,this.password,function(err, isMatch){
        done(err,isMatch);
    });
}

soldierSchema.methods.name = function(){
    return this.username;
}

soldierSchema.methods.rol = function(){
    return  this.role;
}

var Soldier = mongoose.model("Soldier",soldierSchema);
module.exports = Soldier;
