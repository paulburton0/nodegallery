var express = require('express');
var dirlist = require('../list.js');
var path = require('path');
var url = require('url');
var router = express.Router();

var imageDir = '/home/pburton/imagesx';

function getBreadcrumbs(pathname){
    var pathArray = pathname.split('/');
    var breadcrumbArray = [];
    for(i = 1; i < pathArray.length; i++){
        var crumb = {};
        var crumbArray = pathArray.slice(1, i);
        crumb.name = crumbArray.slice(-1).toString();
        crumb.path = '/' + crumbArray.join('/');
        breadcrumbArray.push(crumb);
    }
    breadcrumbArray[0] = {name: 'root', path: '/'};
    return breadcrumbArray;
}

    /* GET home page. */
router.get(/\/.*/, function(req, res, next) {
    var pathname = url.parse(req.originalUrl, true).pathname;
    if(/\.(jpe?g|png|bmp|gif|webm)$/i.test(pathname)){
        next();
    }
    var start = url.parse(req.originalUrl, true).query.start;
    var absPath = path.join(imageDir, pathname);
    if(start == undefined){ 
        start = 0;
    }
    dirlist.getList(absPath, pathname, start, function(err, list){
        res.render('index', {title: pathname, content: list, start: start, pathname: pathname, breadcrumbs: getBreadcrumbs(pathname)});
    });

}, function(req, res, next){
    var pathname = url.parse(req.originalUrl, true).pathname;
    if(/\.webm$/i.test(pathname)){
        next();
    }
    var start = url.parse(req.originalUrl, true).query.start;
    if(start == undefined){ 
        start = 0;
    }
    res.render('image', {title: pathname, image: path.join('/imagesx', pathname), pathname: pathname, start: start, breadcrumbs: getBreadcrumbs(pathname)});
}, function(req, res, next){
    var pathname = url.parse(req.originalUrl, true).pathname;
    var start = url.parse(req.originalUrl, true).query.start;
    if(start == undefined){ 
        start = 0;
    }
    res.render('video', {title: pathname, webm: path.join('/imagesx', pathname), pathname: pathname, start: start, breadcrumbs: getBreadcrumbs(pathname)});
});

module.exports = router;
