const express = require('express');
const path = require('path');
const expressHbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const config = require('./config/database');
var flash = require('express-flash');
const passport = require('passport');

let Article = require('./models/article');
const app = express();
var sessionStore = new session.MemoryStore;
mongoose.connect(config.database);
let db = mongoose.connection;

db.once('open',()=>{
    console.log('Connectedd to MongoDB');
});

db.on('error',()=>{
    console.log(err);
});


app.engine('.hbs', expressHbs({defaultLayout:'layout', extname:'.hbs'}));
app.set('view engine', '.hbs');

app.use(flash());
app.use(bodyParser.urlencoded({extended:app}));
app.use(bodyParser.json());
app.use(session({
    secret: 'I am secret',
    resave: 'true',
    saveUninitialized: true,
    store: sessionStore
}));

// passport config middleware
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
    res.locals.sessionFlash = [];
    next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));



app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
})

app.get('/', function(req, res){
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        }else{
            //console.log(res.locals.sessionFlash);
            res.render('./partials/index',{
                title:'Articles',
                article: articles,
                expressFlash: req.flash('success')
            });
        }
    });
});
app.all('/', function(req, res){
    req.flash('success', 'Article added')
    res.redirect('/');
})

let articles = require('./routes/articles');
let user = require('./routes/user');
app.use('/articles', articles);
app.use('/users', user);

app.listen(3000, function(){
    console.log('Server started on port 3000');
});


