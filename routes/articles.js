const express = require('express');
const router = express.Router();

//Article model
let Article = require('../models/article');

router.get('/add', function(req, res){
    res.render('./partials/add_article',{
        title: 'Add Articles'
    });
});

router.post('/add', function(req, res){
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

router.get('/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
        res.render('./partials/article', {
            article: article
        });
    });
});

router.get('/edit/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
        res.render('./partials/edit_article',{
            title: 'Edit',
            article:article
        });
    });
});

router.post('/edit/:id', function(req, res){
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

router.delete('/:id', function(req, res){
    let query = {_id: req.params.id}
    Article.remove(query, function(err){
        if(err){
            console.log(err);
        }
        req.flash('success','Article deleted');
        res.send('Success');
    });
});

module.exports = router;