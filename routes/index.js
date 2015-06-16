var express = require('express');
var dirlist = require('../list.js');
var path = require('path');
var url = require('url');
var router = express.Router();

var imageDir = '/home/pburton/imagesx';

function getBreadcrumbs(pathname){
    var pathArray = pathname.split('/');
    var breadcrumbArray = [];
    pathArray.map(function(item, index){
        var crumb = {};
        crumb.path = '/' + pathArray.slice(1, index + 1).join('/');
        crumb.name = item;
        breadcrumbArray.push(crumb);
    });
    breadcrumbArray[0] = {name: 'root', path: '/'};
    return breadcrumbArray;
}

    /* GET home page. */
router.get(/\/.*/, function(req, res, next){
    if(! req.cookies.nodegallery){
        req.pathname = '/login';
        res.redirect('/login');
    }
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
        res.end();
    });

}, function(req, res, next){
    if(! req.cookies.nodegallery){
        req.pathname = '/login';
        res.redirect('/login');
    }
    var pathname = url.parse(req.originalUrl, true).pathname;
    if(/\.webm$/i.test(pathname)){
        next();
    }
    var start = url.parse(req.originalUrl, true).query.start;
    if(start == undefined){ 
        start = 0;
    }
    res.render('image', {title: pathname, image: path.join('/imagesx', pathname), pathname: pathname, start: start, breadcrumbs: getBreadcrumbs(pathname)});
    res.end();
}, function(req, res, next){
    if(! req.cookies.nodegallery){
        req.pathname = '/login';
        res.redirect('/login');
    }
    var pathname = url.parse(req.originalUrl, true).pathname;
    var start = url.parse(req.originalUrl, true).query.start;
    if(start == undefined){ 
        start = 0;
    }
    res.render('video', {title: pathname, webm: path.join('/imagesx', pathname), pathname: pathname, start: start, breadcrumbs: getBreadcrumbs(pathname)});
}, function(req, res){
    req.pathname = '/login';
    res.redirect('/login');
});

module.exports = router;
