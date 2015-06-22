var fs = require('fs');
var path = require('path');
var gm = require('gm');
var ffmpeg = require('fluent-ffmpeg');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

var exports = module.exports = {};

exports.getList = function(dir, relDir, start, cb){
    fs.readdir(dir, function(err, files){
        if(err){
            return cb(err);
        }

        if(start > files.length){
            err = '404';
            return cb(err);    
        }

        var dirContents = [];
        var item = {};

        files.sort();

        files.map(function(item, index){
            item = { 'name' : item,  'absolutePath' : path.join(dir, item), 'relativePath' : path.join(relDir, item) };
            
            if(item.name == undefined || /^\./.test(item.name) || /\.html$/i.test(item.name) || /^thumbs$/i.test(item.name)){
                if(index == files.length - 1){
                    composeResults(start, relDir, dirContents, cb);
                }
                else{
                    return;
                }
            }
            
            fs.stat(item.absolutePath, function(err, stats){
                if(stats.isFile() && /\.(jpe?g|png|gif|bmp|webm)/i.test(item.name)){ 
                    item.type = 'file';
                    dirContents.push(item);
                    if(index == files.length - 1){
                        composeResults(start, relDir, dirContents, cb);
                    }
                }
                else if(stats.isDirectory()){
                    item.type = 'directory';
                    dirContents.unshift(item);
                    if(index == files.length - 1){
                        composeResults(start, relDir,  dirContents, cb);
                    }
                }
                else{
                    if(index == files.length - 1){
                        composeResults(start, relDir, dirContents, cb);
                    }
                    else{
                        return;
                    }
                }
            });
        });
    });
}

function composeResults(start, relDir, dirContents, cb){
    dirContentsSlice = dirContents.slice(start, Number(start) + 12);

    if(! dirContents[Number(start) + 13]){
        end = true;
    }
    else{
        end = false;
    }

    var iterator = dirContentsSlice.length;

    var fileResults = [];
    var dirResults = [];
    var results = [];

    dirContentsSlice.map(function(item){
        if(item.type == 'file'){

            var thumbDir = path.join(__dirname, 'public', 'nodegallery_cache', relDir);

            item.thumb = path.join('/nodegallery_cache', relDir, item.name + '.png');
            item.thumbAbsolutePath = path.join(thumbDir, item.name + '.png');

                mkdirp(thumbDir, function(err){
                    if(err){
                        return err;
                    }

                    fs.stat(item.thumbAbsolutePath, function(err, stats){
                        if(err){
                            if(err.code == 'ENOENT'){
                                if(/\.webm$/.test(item.absolutePath)){
                                    ffmpeg(item.absolutePath)
                                        .on('error', function(err, stdout, stderr){
                                            iterator--;
                                            item.thumb = '/images/NoThumb.png';
                                            fileResults.push(item);
                                            if(! iterator){
                                                if(dirResults){
                                                    dirResults.sort();
                                                }
                                                results = results.concat(dirResults, fileResults);
                                                if(end){
                                                    results.push('end');
                                                }
                                                return cb(null, results);
                                            }
                                            return;
                                        })
                                        .on('end', function(){
                                            iterator--;
                                            fileResults.push(item);
                                            if(! iterator){
                                                fileResults.sort();
                                                if(dirResults){
                                                    dirResults.sort();
                                                }
                                                results = results.concat(dirResults, fileResults);
                                                if(end){
                                                    results.push('end');
                                                }
                                                return cb(null, results);
                                            }
                                        })
                                        .seekInput('00:00:05.0')
                                        .frames(1)
                                        .size('200x?')
                                        .save(item.thumbAbsolutePath);
                                }
                                else{
                                    gm(item.absolutePath)
                                    .size(function (err, features) {
                                        if (err){
                                            iterator--;
                                            item.thumb = '/images/NoThumb.png';
                                            fileResults.push(item);
                                            if(! iterator){
                                                fileResults.sort();
                                                if(dirResults){
                                                    dirResults.sort();
                                                }
                                                results = results.concat(dirResults, fileResults);
                                                if(end){
                                                    results.push('end');
                                                }
                                                return cb(null, results);
                                            }
                                            return;
                                        }
                                        
                                        if(features.width > features.height){
                                            gm(item.absolutePath + '[0]')
                                            .resize(200, null) 
                                            .write(item.thumbAbsolutePath, function (err) {
                                                iterator--;
                                                if (err){
                                                    item.thumb = '/images/NoThumb.png';
                                                    fileResults.push(item);
                                                    if(! iterator){
                                                        fileResults.sort();
                                                        if(dirResults){
                                                            dirResults.sort();
                                                        }
                                                        results = results.concat(dirResults, fileResults);
                                                        if(end){
                                                            results.push('end');
                                                        }
                                                        return cb(null, results);
                                                    }
                                                    return;
                                                }
                                                fileResults.push(item);
                                                if(! iterator){
                                                    fileResults.sort();
                                                    if(dirResults){
                                                        dirResults.sort();
                                                    }
                                                    results = results.concat(dirResults, fileResults);
                                                    if(end){
                                                        results.push('end');
                                                    }
                                                    return cb(null, results);
                                                }
                                            });
                                        }
                                        else{
                                            gm(item.absolutePath + '[0]')
                                            .resize(null, 200)
                                            .write(item.thumbAbsolutePath, function (err) {
                                                iterator--;
                                                if (err){
                                                    item.thumb = '/images/NoThumb.png';
                                                    fileResults.push(item);
                                                    if(! iterator){
                                                        fileResults.sort();
                                                        if(dirResults){
                                                            dirResults.sort();
                                                        }
                                                        results = results.concat(dirResults, fileResults);
                                                        if(end){
                                                            results.push('end');
                                                        }
                                                        return cb(null, results);
                                                    }
                                                    return;
                                                }
                                                fileResults.push(item);
                                                if(! iterator){
                                                    fileResults.sort();
                                                    if(dirResults){
                                                        dirResults.sort();
                                                    }
                                                    results = results.concat(dirResults, fileResults);
                                                    if(end){
                                                        results.push('end');
                                                    }
                                                    return cb(null, results);
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                            else{
                                return err;
                            }
                        }
                        else{
                            iterator--;
                            fileResults.push(item);
                            if(! iterator){
                                fileResults.sort();
                                if(dirResults){
                                    dirResults.sort();
                                }
                                results = results.concat(dirResults, fileResults);
                                if(end){
                                    results.push('end');
                                }
                                return cb(null, results);
                            }
                        }
                    });
                });
        }

        else if(item.type == 'directory'){
            iterator--;
            dirResults.push(item);
            if(! iterator){
                dirResults.sort();
                if(fileResults){
                    fileResults.sort();
                }
                results = results.concat(dirResults, fileResults);
                if(end){
                    results.push('end');
                }
                return cb(null, results);
            }
        }
    });
}

exports.cleanup = function(pathname, absPath){
    
    var thumbDir = path.join(__dirname, 'public', 'nodegallery_cache', pathname);

    fs.readdir(thumbDir, function(err, files){
        if(err || ! files){
            return;
        }
        files.map(function(item){
            var thumbPath = path.join(thumbDir, item);
            var originalPath = path.join(absPath, item.replace(/\.png$/, ''));

            fs.stat(thumbPath, function(err, stats){
                if(stats.isFile() || stats.isDirectory()){
                    
                    fs.stat(originalPath, function(err, stats){
                        if(err && err.code == 'ENOENT'){
                            fs.stat(thumbPath, function(err, stats){
                                stats.isFile() ? fs.unlink(thumbPath, function(){return}) : rimraf(thumbPath, function(){return});
                            });
                        }
                        else{
                            return;
                        }
                    });
                }
                else{
                    return;
                }
            });
        });
    });
}
