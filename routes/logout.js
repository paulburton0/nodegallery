var express = require('express');
var router = express.Router();

var cookieName = __dirname.split('/').slice(-2,-1).toString();

router.get('/logout', function(req, res){
    res.clearCookie(cookieName);
    res.redirect('/login');
});

module.exports = router;
