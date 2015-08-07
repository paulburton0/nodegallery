var express = require('express');
var dirlist = require('../list.js');
var path = require('path');
var url = require('url');
var fs = require('fs');
var router = express.Router();
var settings = require('../settings');
var auth = require('../auth');

var imageDir = settings.imageDirectory;

// getBreadcrumbs composes the current path in a way that can be processed by the view.
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

// Regex here catches all requests
router.get(/\/.*/, function(req, res, next){
    if(req.cookies.nodegallery != auth.username){
        req.pathname = '/login';
        res.redirect('/login');
    }
    var pathname = url.parse(req.originalUrl, true).pathname;
    var absPath = path.join(imageDir, pathname);
    absPath = absPath.replace(/%20/g, ' ');
    fs.stat(absPath, function(err, stats){ // If the requested file/directory doesn't exist, return a 404.
        if(err){
            console.log(err);
        }
        if(! stats){
            res.status(404).send('The item you\'re looking for doesn\'t exist');
            res.end();
        }
        else{
            var start = url.parse(req.originalUrl, true).query.start;
            if(start == undefined){ 
                start = 0;
            }
            if(stats.isFile()){ // If the requested resource is a file, skip to the next route handler.
                next();
            }
            else if(stats.isDirectory()){
                dirlist.getList(absPath, pathname, start, function(err, list){ // Call the getList function in list.js
                    if(err){
                        if(err == '404'){
                            res.status(404).send('The item you\'re looking for doesn\'t exist');
                            res.end();
                        }
                        else if(err == '999'){
                            res.send('There\'s nothing here.')
                            res.end();
                        }
                        else{
                            console.log(err);
                        }
                    }
                    res.render('index', {title: pathname, content: list, start: start, pathname: pathname, breadcrumbs: getBreadcrumbs(pathname)});
                    dirlist.getList(absPath, pathname, Number(start) + 12, function(err, list){return}); // After the response is sent, call getList again for the next set of 12 images to pre-cache the thumbnails, if needed.
                });
                dirlist.cleanup(pathname, absPath); // Clean up the directory in case contents have been moved/deleted.
            }
            else{
                res.status(404).send('The item you\'re looking for doesn\'t exist');
                res.end();
            }
        }
    });
}, function(req, res, next){
    if(req.cookies.nodegallery != auth.username){
        req.pathname = '/login';
        res.redirect('/login');
    }
    var pathname = url.parse(req.originalUrl, true).pathname;
    if(/\.(webm|mp4)$/i.test(pathname)){ // If the requested resource is a webm video, skip to the next route handler.
        next();
    } 
    var start = url.parse(req.originalUrl, true).query.start;
    if(start == undefined){ 
        start = 0;
    }
    var relativeImageDir = settings.imageDirectory.split('/');
    var relativeImageDir = '/' + relativeImageDir.slice(-1);
    res.render('image', {title: pathname, image: path.join(relativeImageDir, pathname), pathname: pathname, start: start, breadcrumbs: getBreadcrumbs(pathname)});
}, function(req, res, next){
    if(req.cookies.nodegallery != auth.username){
        req.pathname = '/login';
        res.redirect('/login');
    }
    var pathname = url.parse(req.originalUrl, true).pathname;
    var start = url.parse(req.originalUrl, true).query.start;
    if(start == undefined){ 
        start = 0;
    }
    var relativeImageDir = settings.imageDirectory.split('/');
    var relativeImageDir = '/' + relativeImageDir.slice(-1);
    res.render('video', {title: pathname, webm: path.join(relativeImageDir, pathname), pathname: pathname, start: start, breadcrumbs: getBreadcrumbs(pathname)});
}, function(req, res){
    req.pathname = '/login';
    res.redirect('/login');
});

module.exports = router;
