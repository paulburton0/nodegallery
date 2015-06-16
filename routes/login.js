var auth = require('../auth');
var express = require('express');
var router = express.Router();

router.get('/login', function(req, res){
    res.render('login', {title: 'Login'});
    res.end();
});

router.post('/login' , function(req, res) {
    if(req.body.user == auth.username && req.body.password == auth.password){
        res.cookie('nodegallery', 'loggedIn', { maxAge: 604800000, httpOnly: false }); 
        res.redirect('/');
        res.end();
    }
    else{
        alertMessage = 'Username or Password were incorrect. Please try again.';
        res.render('login', {title: 'Login', alertMessage: alertMessage});
        res.end();
    }
});

module.exports = router;
