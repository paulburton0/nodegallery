var express = require('express');
var dirlist = require('../list.js');
var path = require('path');
var url = require('url');
var router = express.Router();

var imageDir = '/home/pburton/imagesx';

    /* GET home page. */
router.get(/\/.*/, function(req, res, next) {
    var pathname = url.parse(req.originalUrl, true).pathname;
    if(/\.(jpe?g|png|bmp|gif)$/.test(pathname)){
        next();
    }
    var start = url.parse(req.originalUrl, true).query.start;
    var absPath = path.join(imageDir, pathname);
    if(start == undefined){ 
        start = 0;
    }
    dirlist.getList(absPath, pathname, start, function(err, list){
        res.render('index', {title: pathname, content: list, start: start, pathname: pathname});
    });

}, function(req, res, next){
    var pathname = url.parse(req.originalUrl, true).pathname;
    var start = url.parse(req.originalUrl, true).query.start;
    if(start == undefined){ 
        start = 0;
    }
    res.render('image', {title: pathname, image: path.join('/imagesx', pathname), pathname: pathname, start: start});
});

module.exports = router;
