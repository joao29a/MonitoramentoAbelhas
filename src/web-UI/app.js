
/**
 * Module dependencies.
 */

var express     =  require('express')
  , routes      =  require('./routes')
  , getDados    =  require('./routes/getDados')
  , getHistoric =  require('./routes/getHistoric')
  , getNodes    =  require('./routes/getNodes')
  , exportData  =  require('./routes/exportData')
  , deleteData  =  require('./routes/deleteData')
  , _mysql      =  require('mysql')
  , passport    =  require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , flash       = require('connect-flash')
  , fs          = require('fs')
  , exec        = require('child_process').exec
  , dataDB      =  require('./public/javascripts/dataDAO');

// DataBase - Mysql

var HOST       = 'localhost';
var PORT       = 3306;
var MYSQL_USER = 'root';
var MYSQL_PASS = '123';
var DATABASE   = 'monitorAbelhas';

var user = {
    id: 1,
    username: 'minhacasa',
    pass: '',
};

var db_config = {
    host    : HOST,
    port    : PORT,
    user    : MYSQL_USER,
    password: MYSQL_PASS,
};

var mysql;

dataDAO = null;

function connectToDatabase() {
    mysql = _mysql.createConnection(db_config); // Recreate the connection, since
                                                    // the old one cannot be reused.
    mysql.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(connectToDatabase, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    mysql.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        connectToDatabase();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
    mysql.query('use ' + DATABASE);
    if (dataDAO != null)
        delete dataDAO;
    dataDAO = new dataDB.dataDAO(mysql);
}

connectToDatabase();

function getUserId(id, callback) {
    if (user.id == id) {
        callback(null, user);
    }
    else callback(new Error('Usuario' + id + ' inexistente'));
}

function getUsername(username, callback) {
    if (user.username === username) {
        return callback(null, user);
    }
    return callback(null, null);
}

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    getUserId(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        process.nextTick(function () {
            getUsername(username, function(err, user) {
                if (!user) { return done(null, false, { message: 'Usuario desconhecido ' + username }); }
                if (user.pass != password) { return done(null, false, { message: 'Senha invalida.' }); }
                return done(null, user);
            });
            });
        }));

// Instaciation
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
   app.use(express.logger());
   app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'sistema monitoramento' }));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

function checkFolders(callback) {
    var path = 'public/imagens/';
    if (fs.existsSync(path)) {
        var data = fs.readdirSync(path);
        if (data.length > 0) {
            callback(data);
        }
    }
}

function getImages(folder, callback) {
    var path = 'public/imagens/' + folder;
    if (fs.existsSync(path)) {
        var data = fs.readdirSync(path);
        if (data.length > 0) {
            var datatime = []; 
            for (var j = 0; j < data.length; j++) {
                datatime.push([data[j], fs.statSync(path + '/' + data[j]).ctime]);
            }
            datatime.push(folder);
            callback(datatime);
        }
    }
}

function getVideos(callback) {
    var path = 'public/javascripts/smp/videos';
    if (fs.existsSync(path)) {
        var videos = fs.readdirSync(path);
        callback(videos);
    }
}

app.get('/',                      ensureAuthenticated   , routes.index);
app.get('/getDados/:interval',    ensureAuthenticated   , getDados.getDados);
app.get('/getNodes',              ensureAuthenticated   , getNodes.getNodes);
app.get('/getHistoric/:nodeName', ensureAuthenticated   , getHistoric.getHistoric);
app.get('/exportData/:mode',      ensureAuthenticated   , exportData.exportData);
app.get('/deleteData/:mode',      ensureAuthenticated   , deleteData.deleteData);
app.get('/pictures',             ensureAuthenticated   , function(req, res){
    checkFolders(function(data) {
        res.render('picturesFolders', {layout: false, result : data});
    });
});
app.get('/pictures/:folder',             ensureAuthenticated   , function(req, res){
    getImages(req.params.folder, function(data) {
        res.render('pictures', {layout: false, result : data});
    });
});
app.get('/videos', ensureAuthenticated, function(req, res) {
    getVideos(function(data) {
        res.render('videos', {layout: false, result: data});
    });
});
app.get('/gate', ensureAuthenticated, function(req, res) {
    exec('sudo ./public/portao', function(error, stdout, stderr) {
        if (error == null) {
            res.render('layoutEmpty', {layout: false});
        }
        else console.log(error);
    });
});


app.get('/login', function(req, res){
    res.render('login', { user: req.user, message: req.flash('error')});
});

app.post('/login',
    passport.authenticate('local', { successRedirect: '/',
                                     failureRedirect: '/login', 
                                     failureFlash: true })
);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

//Extra

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
