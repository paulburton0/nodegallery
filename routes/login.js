var crypto = require('crypto');
var settings = require('../settings');
if(settings.useAuth){
    var auth = require('../auth');
}
var express = require('express');
var router = express.Router();

var cookieName = __dirname.split('/').slice(-2,-1).toString();

router.get('/login', function(req, res){
    res.render('login', {title: 'Login'});
});

router.post('/login' , function(req, res) {
    username = req.body.user.toLowerCase();
    var pwdHash = crypto.createHash('sha256').update(req.body.password).digest('hex');
    if(username.substr(-1) == ' '){
        username = username.trimRight();    
    }
    if(auth[username] && pwdHash == auth[username].password){
        res.cookie(cookieName, username, { maxAge: 604800000, httpOnly: false }); 
        res.redirect('/');
    }
    else{
        alertMessage = 'Username or Password were incorrect. Please try again.';
        res.render('login', {title: 'Login', alertMessage: alertMessage});
        alertMessage = null;
    }
});

module.exports = router;
