var auth = require('../auth');
var express = require('express');
var router = express.Router();

router.get('/login', function(req, res){
    res.render('login', {title: 'Login'});
});

router.post('/login' , function(req, res) {
    if(req.body.user == auth.username && req.body.password == auth.password){
        res.cookie('nodegallery', req.body.user, { maxAge: 604800000, httpOnly: false }); 
        res.redirect('/');
    }
    else{
        alertMessage = 'Username or Password were incorrect. Please try again.';
        res.render('login', {title: 'Login', alertMessage: alertMessage});
    }
});

module.exports = router;
