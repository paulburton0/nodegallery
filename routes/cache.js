var express = require('express');
var router = express.Router();

    /* GET home page. */
router.get(/\/\.nodegallery_cache\/.*/, function(req, res, next) {
    res.render('index', {title: pathname, content: list});
});

module.exports = router;
