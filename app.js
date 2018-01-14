const express = require('express');
const path = require('path');
const expressHbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
var flash = require('express-flash');

let Article = require('./models/article');

const app = express();
var sessionStore = new session.MemoryStore;
mongoose.connect('mongodb://localhost/blogger');
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

app.get('/articles/add', function(req, res){
    res.render('./partials/add_article',{
        title: 'Add Articles'
    });
});
app.all('/', function(req, res){
    req.flash('success', 'Article added')
    res.redirect('/');
})

app.post('/articles/add', function(req, res){
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    let errors = req.validationErrors();
    if(errors){
        res.render('./partials/add_article',{
            title: 'Add Article',
            errors:errors
        });
    }else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.body.author;
        article.body = req.body.body;
        article.save(function(err){
        if(err){
            console.log(err);
        }else{
            req.flash('success', 'Article added');
            res.redirect('/');
        }
    });
    }

    
});

app.get('/articles/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
        res.render('./partials/article', {
            article: article
        });
    });
});

app.get('/articles/edit/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
        res.render('./partials/edit_article',{
            title: 'Edit',
            article:article
        });
    });
});

app.post('/articles/edit/:id', function(req, res){
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}

    Article.update(query, article, function(err){
        if(err){
            console.log(err);
            return;
        }else{
            req.flash('success', 'Articles updated');
            res.redirect('/');
        }
    });
});

app.delete('/articles/:id', function(req, res){
    let query = {_id: req.params.id}
    Article.remove(query, function(err){
        if(err){
            console.log(err);
        }
        req.flash('success','Article deleted');
        res.send('Success');
    })
})

app.listen(3000, function(){
    console.log('Server started on port 3000');
});


