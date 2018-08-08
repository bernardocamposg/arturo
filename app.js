var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var passport = require("passport");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var flash = require("connect-flash");
var methodOverride = require('method-override');

var routes = require("./routes");
var passportsetup = require("./passportsetup");
var app = express();

mongoose.connect("mongodb://bernardo:123bernardo@ds113732.mlab.com:13732/gears");
//"mongodb://mongodb://bernardo:123bernardo@ds113732.mlab.com:13732/gears"
//"mongodb://localhost:27017/zombies_nest"

passportsetup();

app.set("port", process.env.PORT || 3000);

app.set("views", path.resolve(__dirname,"views"));
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: "TKRv0iJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,>>MX",
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.use(passport.initialize({
    userProperty:"soldier"
}));
app.use(passport.session());
app.use(routes);

app.listen(app.get("port"),()=>{
    console.log("La aplicación inició por el puerto "+ app.get("port"));
});