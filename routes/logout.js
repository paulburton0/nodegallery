var express = require('express');
var router = express.Router();

router.get('/logout', function(req, res){
    res.clearCookie('nodegallery');
    res.redirect('/login');
});

module.exports = router;
