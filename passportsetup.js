var passport = require("passport");
var Soldier = require("./models/soldier");

var LocalStrategy = require("passport-local").Strategy;

module.exports = () => {
    passport.serializeUser((soldier,done)=>{
        done(null,soldier._id);
    });
    passport.deserializeUser((id,done)=>{
        Soldier.findById(id,(err,soldier)=>{
            done(err,soldier);
        });
    });
};

passport.use("login", new LocalStrategy(function(username,password,done){
    Soldier.findOne({username: username}, function(err,soldier){
        if(err){
            return done(err);
        }
        if(!soldier){
            return done(null,false,{message:"No existe ningun soldier con ese nombre"})
        }
        soldier.checkPassword(password,(err,isMatch)=>{
            if(err){
                return done(err);
            }
            if(isMatch){
                return done(null,soldier);
            } else{
                return done(null,false,{message:"La contraseña no es valida"})
            }
        })
    })
}));