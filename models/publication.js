var bcrypt = require("bcrypt-nodejs");
var mongoose = require("mongoose");

var SALT_FACTOR = 10

var publicationSchema = mongoose.Schema({
    description:{type: String, require:true},
    date:{type: String, require:true},
    category:{type: String, require:true}
});
/*
var donothing =()=>{

}

zombieSchema.pre("save", function(done){
    var zombie = this;
    if(!zombie.isModified("password")){
        return done();
    }
    bcrypt.geneSalt(SALT_FACTOR,(err, salt)=>{
        if(err){
            return done(err);
        }
        bcrypt.hash(zombie.password, salt, donothing,
        (err,hashedpassword)=>{
            if(err){
                return done(err);
            }
            zombie.password = hashedpassword;
            done();
        });
    });
});

zombieSchema.methods.checkPassword = (guess, done)=>{
    bcrypt.compare(guess, this.password,(err,isMatch)=>{
        done(err,isMatch);
    });
}

zombieSchema.methods.name = function(){
    return this.displayName || this.username;
}
*/
var Publication = mongoose.model("Publication", publicationSchema);
module.exports = Publication;