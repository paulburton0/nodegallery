var auth = require('../auth');
var express = require('express');
var router = express.Router();

var cookieName = __dirname.split('/').slice(-2,-1).toString();

router.get('/login', function(req, res){
    res.render('login', {title: 'Login'});
});

router.post('/login' , function(req, res) {
    if(req.body.user == auth.username && req.body.password == auth.password){
        res.cookie(cookieName, req.body.user, { maxAge: 604800000, httpOnly: false }); 
        res.redirect('/');
    }
    else{
        alertMessage = 'Username or Password were incorrect. Please try again.';
        res.render('login', {title: 'Login', alertMessage: alertMessage});
        alertMessage = null;
    }
});

module.exports = router;
