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
    if(settings.useAuth && req.cookies.nodegallery != auth.username){
        req.pathname = '/login';
        res.redirect('/login');
    }
    var pathname = url.parse(req.originalUrl, true).pathname;
    var absPath = path.join(imageDir, pathname);
    absPath = absPath.replace(/%20/g, ' ');
    fs.stat(absPath, function(err, stats){ // If the requested file/directory doesn't exist, return a 404.
        if(err){
            console.error(err);
        }
        if(! stats){
            res.render('404');
            res.end();
            return;
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
                dirlist.getList(start, absPath, pathname, function(err, list){ // Call the getList function in list.js
                    if(err){
                        if(err == '404'){
                            res.render('404');
                            res.end();
                            return;
                        }
                        else if(err == '999'){
                            console.error('HERE!!!');
                            res.render('empty');
                            res.end();
                            return;
                        }
                        else{
                            console.error(err);
                        }
                    }
                    dirlist.composeResults(start, pathname, list, function(err, shortList){
                        res.render('index', {title: pathname, content: shortList, start: start, pathname: pathname, breadcrumbs: getBreadcrumbs(pathname)});
                        dirlist.getList(start, absPath, pathname, function(err, list){
                            dirlist.composeResults(Number(start) + 12, pathname, list, function(){return});
                        }); // After the response is sent, call getList again for the next set of 12 images to pre-cache the thumbnails, if needed.
                        dirlist.cleanup(pathname, absPath); // Clean up the directory in case contents have been moved/deleted.
                    });
                });
            }
            else{
                res.render('404');
                res.end();
                return;
            }
        }
    });
}, function(req, res, next){
    if(settings.useAuth && req.cookies.nodegallery != auth.username){
        req.pathname = '/login';
        res.redirect('/login');
    }
    var pathname = url.parse(req.originalUrl, true).pathname;
    var parentDir = pathname.split('/')
    var absPath = path.join(imageDir, pathname);
    if(/\.(webm|mp4)$/i.test(pathname)){ // If the requested resource is a webm video, skip to the next route handler.
        next();
    } 
    var start = url.parse(req.originalUrl, true).query.start;
    var number = url.parse(req.originalUrl, true).query.number;
    if(start == undefined){ 
        start = 0;
    }
    var imageRoot = settings.imageDirectory.split('/').slice(-1).toString();
    var absImagePath = '/' + path.join(imageRoot, pathname);
    var relParentDir = pathname.split('/').slice(0, -1).join('/');
    var absParentDir = path.join(settings.imageDirectory, relParentDir);
    dirlist.getList(start, absParentDir, relParentDir, function(err, list){
        if(err){
            console.error(err);
        }
        res.render('image', {title: pathname, image: absImagePath, pathname: pathname, start: start, number: number, breadcrumbs: getBreadcrumbs(pathname), list: list});
    });
}, function(req, res, next){
    if(settings.useAuth && req.cookies.nodegallery != auth.username){
        req.pathname = '/login';
        res.redirect('/login');
    }
    var pathname = url.parse(req.originalUrl, true).pathname;
    var start = url.parse(req.originalUrl, true).query.start;
    if(start == undefined){ 
        start = 0;
    }

    var start = url.parse(req.originalUrl, true).query.start;
    var number = url.parse(req.originalUrl, true).query.number;
    if(start == undefined){ 
        start = 0;
    }
    var imageRoot = settings.imageDirectory.split('/').slice(-1).toString();
    var absImagePath = '/' + path.join(imageRoot, pathname);
    var relParentDir = pathname.split('/').slice(0, -1).join('/');
    var absParentDir = path.join(settings.imageDirectory, relParentDir);
    dirlist.getList(start, absParentDir, relParentDir, function(err, list){
        if(err){
            console.error(err);
        }
        res.render('video', {title: pathname, webm: absImagePath, pathname: pathname, start: start, number: number,  breadcrumbs: getBreadcrumbs(pathname), list: list});
    });
}, function(req, res){
    req.pathname = '/login';
    res.redirect('/login');
});

module.exports = router;
