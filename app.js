const express = require('express');
const path = require('path');
const expressHbs = require('express-handlebars');
const mongoose = require('mongoose');
const sessions = require('express-session');
const bodyParser = require('body-parser');
let Article = require('./models/article');
const app = express();

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

app.use(bodyParser.urlencoded({extended:app}));
app.use(bodyParser.json());
app.use(sessions({
    secret: 'I am secret',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        }else{
            res.render('./partials/index',{
                title:'Articles',
                article: articles
            });
        }
    });
});

app.get('/articles/add', function(req, res){
    res.render('./partials/add_articles',{
        title: 'Add Articles'
    });
});

app.post('/articles/add', function(req, res){
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    article.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect('/');
        }
    });
});

app.listen(3000, function(){
    console.log('Server started on port 3000');
});