var express = require("express");
var Soldier = require("./models/soldier");
var Publication = require("./models/publication");
var passport = require("passport");
var acl = require('express-acl');
var router = express.Router();
var pdf = require('pdfkit');
var fs = require('fs');
var blobStream  = require('blob-stream');
var path = require("path");
var crypto = require('crypto');
var mongoose = require('mongoose');
var multer = require('multer');
var GridFsStorage = require('multer-gridfs-storage');
var Grid = require('gridfs-stream');
var moment = require('moment');


acl.config({
    baseUrl:'/',
    defaultRole:'soldier',
    decodedObjectName: 'soldier',
    roleSearchPath: 'soldier.role'
});

router.use(acl.authorize);

router.use((req, res, next) => {

    res.locals.currentSoldier = req.soldier;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    if(req.isAuthenticated()){
        req.session.role = req.soldier.role;
        console.log(req.soldier,"siiiiiiiiiii");
    }
    console.log(req.soldier,"hola");
    next();
});

router.use((req, res, next) => {
    res.locals.currentPublication = req.publication;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
});

router.get("/",(req, res, next) => {
    Soldier.find()
    .sort({ createdAt: "descending" })
    .exec((err, soldiers) => {
        if(err){
            return next(err);
        }
        res.render("index",{ soldiers:soldiers });
    });
});

router.get("/allpublications",(req, res, next) => {
    Publication.find()
    .exec((err, allpublications) => {
        if(err){
            return next(err);
        }
        res.render("allpublications",{ allpublications:allpublications });
    });
});

router.get("/signup", (req,res) => {
    res.render("signup");
});

router.get("/signup", (req,res) => {
    res.render("signup");
});
router.post("/searchdate", (req,res,next) => {
  var date = req.body.date;
  var nacimiento = moment(date);
  var fechahoy = moment();
  var anios = fechahoy.diff(nacimiento,"years");
  console.log(anios);
  res.render("seedate",{date:anios})
  //res.render("fecha",anios);

});
router.post("/signup", (req,res,next) => {
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;

    Soldier.findOne({ username: username}, (err,soldier) => {
        if(err){
            return next(err);
        }
        if(soldier){
            req.flash("error", "El nombre de usuario ya ha sido tomado por otro soldier");
            return res.redirect("/signup");
        }
        var newSoldier = new Soldier({
            username: username,
            password: password,
            role: role
        });
        newSoldier.save(next);
        return res.redirect("/");
    });
});

router.post("/createpdf", (req,res,next) => {
    var titulo1 = req.body.titulo1;
    var titulo2 = req.body.titulo2;
    var titulo3 = req.body.titulo3;
    var myDoc = new pdf();
    var stream = myDoc.pipe(fs.createWriteStream('img/'+titulo1+'pdf'));
    if((titulo1+'.pdf') != myDoc.pipe(fs.createWriteStream('img/'+titulo1+'.pdf'))){
    
    myDoc.fontSize(10).text('Publicacion: '+titulo1, 100, 120);
    myDoc.font('Times-Roman').fontSize(10).text('Categoria:'+titulo2,100 , 140);
    myDoc.fontSize(10).text('Fecha: '+titulo3, 100, 160);
    myDoc.end();
    return res.redirect("/allpublications");
    }else{
    
        req.flash("error", "Esta publicación ya se ha guardadp");
        return res.redirect('/img/'+titulo1+'.pdf');
    }
});

router.post("/createpublication", (req,res,next) => {
    
    var description = req.body.description;
    var date = req.body.date;
    var category = req.body.category;

    Publication.findOne({ description: description}, (err,Public) => {
        if(err){
            return next(err);
        }
        if(Public){
            req.flash("error", "Esta publicación ya se ha registrado");
            return res.redirect("/createpublication");
        }
        var newPublication = new Publication({
            description:description,
            date:date,
            category:category
        });
        newPublication.save(next);
        return res.redirect("/allpublications");
    });
});

router.get("/soldiers/:username", (req, res, next) => { 
    Soldier.findOne({ username: req.params.username }, (err, soldier) => {
        if(err){
            return next(err);
        }
        if(!soldier){
            return next(404);
        }
        res.render("profile", { soldier: soldier });
    });
});

router.get("/allpublications", (req,res) => {
    res.render("allpublications");
});

router.get("/createpublication", (req,res) => {
    res.render("createpublication");
});

router.get("/login",(req, res) => {
    res.render("login");
});

router.post("/login",passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/",
    failureFlash: true
}));

router.get("/logout",(req, res) => {
    req.logout();
    res.redirect("/");
})

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated){
        next();
    }else{
        req.flash("info", "Necesitas iniciar sesión para poder ver esta sección");
        res.redirect("/login");
    }
}

router.get("/edit", ensureAuthenticated, (req, res) => {
    res.render("edit");
});

router.post("/edit", ensureAuthenticated, (req, res, next) => {
    req.soldier.displayName = req.body.displayName;
    req.soldier.bio = req.body.bio;
    req.soldier.save((err) => {
        if(err){
            next(err);
            return;
        }
        req.flash("info", "Perfil autorizado!");
        res.redirect("/edit");
    });
});





// Mongo URI
var mongoURI = 'mongodb://localhost:27017/gears';

// Create mongo connection
var conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
var storage = new GridFsStorage({
    url: 'mongodb://localhost:27017/gears',
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          var filename = buf.toString('hex') + path.extname(file.originalname);
          var fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  var upload = multer({ storage });
  
  // @route GET /
  // @desc Loads form
  router.get('/createimg', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        res.render('createimg', { files: false });
      } else {
        files.map(file => {
          if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
        });
        res.render('createimg', { files: files });
      }
    });
  });
  
  // @route POST /upload
  // @desc  Uploads file to DB
  router.post('/upload', upload.single('file'), (req, res) => {
    // res.json({ file: req.file });
    res.redirect('/createimg');
  });
  
  // @route GET /files
  // @desc  Display all files in JSON
  router.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'No files exist'
        });
      }
  
      // Files exist
      return res.json(files);
    });
  });
  
  // @route GET /files/:filename
  // @desc  Display single file object
  router.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
      // File exists
      return res.json(file);
    });
  });
  
  // @route GET /image/:filename
  // @desc Display Image
  router.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
  
      // Check if image
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        var readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
  });
  
  // @route DELETE /files/:id
  // @desc  Delete file
  router.delete('/files/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
      if (err) {
        return res.status(404).json({ err: err });
      }
  
      res.redirect('/createimg');
    });
  });


/////////////////////////////////////////////////////////

 // @route GET /
  // @desc Loads form
  router.get('/seeimg', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        res.render('seeimg', { files: false });
      } else {
        files.map(file => {
          if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
        });
        res.render('seeimg', { files: files });
      }
    });
  });


module.exports = router;
