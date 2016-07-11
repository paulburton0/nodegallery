var express = require('express');
var dirlist = require('../list.js');
var path = require('path');
var url = require('url');
var fs = require('fs');
var router = express.Router();
var settings = require('../settings');
var auth = require('../auth');

var imageDir = settings.imageDirectory;
var cookieName = __dirname.split('/').slice(-2,-1).toString();

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
    var pathname = url.parse(req.originalUrl, false).pathname;
    if(settings.useAuth && ! req.cookies[cookieName]){
        req.pathname = '/login';
        return res.redirect('/login');
    }
    else if(settings.useAuth && auth[req.cookies[cookieName]].permissions != null && ! dirlist.checkPerms(req.cookies[cookieName], pathname)){
        return res.render('404');
    }
    else{
        var absPath = path.join(imageDir, pathname);
        absPath = absPath.replace(/%20/g, ' ');
        fs.stat(absPath, function(err, stats){ // If the requested file/directory doesn't exist, return a 404.
            if(err){
                console.error(err);
            }
            if(! stats){
                return res.render('404');
            }
            else{
                var start = url.parse(req.originalUrl, true).query.start;
                if(start == undefined){ 
                    start = 0;
                }
                if(stats.isFile()){ // If the requested resource is a file, skip to the next route handler.
                    return next();
                }
                else if(stats.isDirectory()){
                    dirlist.getList(start, absPath, pathname, req.cookies[cookieName], function(err, list){ // Call the getList function in list.js
                        if(err){
                            if(err == '404'){
                                return res.render('404');
                            }
                            else if(err == '999'){
                                return res.render('empty');
                            }
                            else{
                                console.error(err);
                            }
                        }
                        dirlist.composeResults(start, pathname, list, function(err, shortList){
                            res.render('index', {title: pathname, content: shortList, start: start, pathname: pathname, breadcrumbs: getBreadcrumbs(pathname), auth: settings.useAuth, total: list.length});
                            dirlist.cleanup(pathname, absPath); // Clean up the directory in case contents have been moved/deleted.
                            dirlist.getList(start, absPath, pathname, req.cookies[cookieName], function(err, list){
                                dirlist.composeResults(Number(start) + 12, pathname, list, function(){return;});
                            }); // After the response is sent, call getList again for the next set of 12 images to pre-cache the thumbnails, if needed.
                        });
                    });
                }
                else{
                    return res.render('404');
                }
            }
        });
    }
}, function(req, res, next){
    if(settings.useAuth && ! req.cookies[cookieName]){
        req.pathname = '/login';
        return res.redirect('/login');
    }
    else{
        var pathname = url.parse(req.originalUrl, false).pathname;
        if(/\.(webm|mp4)/i.test(pathname)){ // If the requested resource is a webm video, skip to the next route handler.
            return next();
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
        dirlist.getList(start, absParentDir, relParentDir, req.cookies[cookieName], function(err, list){
            if(err){
                console.error(err);
            }
            return res.render('image', {title: pathname, image: absImagePath, pathname: pathname, start: start, number: number, breadcrumbs: getBreadcrumbs(pathname), list: list, auth: settings.useAuth});
        });
    }
}, function(req, res, next){
    if(settings.useAuth && ! req.cookies[cookieName]){
        req.pathname = '/login';
        return res.redirect('/login');
    }
    else{
        var pathname = url.parse(req.originalUrl, false).pathname;
        var start = url.parse(req.originalUrl, true).query.start;
        var number = url.parse(req.originalUrl, true).query.number;
        if(start == undefined){ 
            start = 0;
        }
        var imageRoot = settings.imageDirectory.split('/').slice(-1).toString();
        var absImagePath = '/' + path.join(imageRoot, pathname);
        var relParentDir = pathname.split('/').slice(0, -1).join('/');
        var absParentDir = path.join(settings.imageDirectory, relParentDir);
        dirlist.getList(start, absParentDir, relParentDir, req.cookies[cookieName], function(err, list){
            if(err){
                console.error(err);
            }
            return res.render('video', {title: pathname, webm: absImagePath, pathname: pathname, start: start, number: number, breadcrumbs: getBreadcrumbs(pathname), list: list, auth: settings.useAuth});
        });
    }
});
module.exports = router;
