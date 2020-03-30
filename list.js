var fs = require('fs');
var path = require('path');
var im = require('gm');
var ffmpeg = require('fluent-ffmpeg');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var settings = require('./settings');
var reverse = settings.reverseSort;

if(settings.useAuth){
    var auth = require('./auth');
}

var exports = module.exports = {};

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function checkPerms(userName, directory){
    if(!settings.useAuth || auth[userName].permissions == null){
        return true;
    }
    if(/^\/$/.test(directory)){
        return true;
    }
    else{
        if(/\/$/.test(directory)){
            directory = directory.substring(0,directory.length-1);
        }
        if(auth[userName].permissions[directory] == 'deny'){
            return false;    
        }
        else{
            return true;
        }
    }
}

exports.checkPerms = checkPerms;
// Get the listing for the entire directory.
// dir - absolute path to the directory containing images
// reDir - relative path, used to cache thumbnails
// start - from the URL attribute 'start'
exports.getList = function(start, dir, relDir, userName, cb){
    fs.readdir(dir, function(err, files){
        if(err){
            console.error(err);
            errCode = '404'
            return cb(errCode);
        }

        // If the 'start' query parameter is past the end of the files array, return a 404 error to the router.
        if(start > files.length){
            errCode = '404';
            return cb(errCode);    
        }
        
        if(files.length == 0){
            errCode = '999';
            return cb(errCode);
        }

        var filesTemp = [];
        var iterator = files.length;

        files.map(function(item){
            var stats = fs.stat(path.join(dir, item), function(err, stats){
                if(err){
                    console.error("Cannot read %s. Perhaps a corrupt file or a bad symlink.", item);
                    iterator--;
                    if(! iterator){
                        if(filesTemp.length == 0){
                            errCode = '999';
                            return cb(errCode);
                        }
                    }
                    else{
                        return;
                    }
                }

                else if(stats && stats.isDirectory()){
                    if(checkPerms(userName, path.join(relDir, item))){
                        filesTemp.push(item);
                        iterator--;
                        if(! iterator){
                            if(filesTemp.length == 0){
                                errCode = '999';
                                return cb(errCode);
                            }
                        }
                    }
                }

                else if(stats && stats.isFile() && /\.(jpe?g|png|gif|bmp|webm|mp4)$/i.test(item)){
                    filesTemp.push(item);
                    iterator--;
                    if(! iterator){
                        if(filesTemp.length == 0){
                            errCode = '999';
                            return cb(errCode);
                        }
                    }
                }
                else{
                    iterator--;
                    if(! iterator){
                        if(filesTemp.length == 0){
                            errCode = '999';
                            return cb(errCode);
                        }
                    }
                }
            });
        });

        var dirDirs = [];
        var dirFiles = [];
        var dirContents = [];
        var item = {};


        files.map(function(item, index){
            // Each item in the directory becomes an object.
            item = { 'name' : item,  'absolutePath' : path.join(dir, item), 'relativePath' : path.join(relDir, item) };
            
            // Do not include files/directories that start with '.' or html files.
            if(item.name == undefined || /^\./.test(item.name) || /\.html?$/i.test(item.name)){
                if(index == files.length - 1){
                    dirDirs.sort(function(a, b){
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                    });
                    dirFiles.sort(function(a, b){
                        return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                    });
                    dirContents = dirDirs.concat(dirFiles);
                        if(reverse){
                            dirContents.reverse();
                        }
                        dirContents.map(function(item, index){
                            item.number = index;    
                        });

                    return cb(null, dirContents);
                }
                else{
                    return;
                }
            }
            
            // Stat the item
            fs.stat(item.absolutePath, function(err, stats){
                // If the item is an image file
                if(stats && stats.isFile() && /\.(jpe?g|png|gif|bmp|webm|mp4)$/i.test(item.name)){ 
                    item.type = 'file';
                    dirFiles.push(item); // This is the intermediate list of 'item' objects. Files get pushed to the end of the array.
                    if(index == files.length - 1){
                        dirDirs.sort(function(a, b){
                            return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                        });
                        dirFiles.sort(function(a, b){
                            return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                        });
                        dirContents = dirDirs.concat(dirFiles);
                        if(reverse){
                            dirContents.reverse();
                        }
                        dirContents.map(function(item, index){
                            item.number = index;    
                        });

                        return cb(null, dirContents);
                    }
                }
                else if(stats && stats.isDirectory()){
                    if(! checkPerms(userName, item.relativePath)){
                        if(index == files.length - 1){
                            dirDirs.sort(function(a, b){
                                return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                            });
                            dirFiles.sort(function(a, b){
                                return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                            });
                            dirContents = dirDirs.concat(dirFiles);
                            if(reverse){
                                dirContents.reverse();
                            }
                            dirContents.map(function(item, index){
                                item.number = index;    
                            });

                            return cb(null, dirContents);
                        }
                        else{
                            return;
                        }
                    }
                    else{
                        item.type = 'directory';
                        dirDirs.push(item); // Directories get unshifted to the beginning of the array.
                        if(index == files.length - 1){
                            dirDirs.sort(function(a, b){
                                return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                            });
                            dirFiles.sort(function(a, b){
                                return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                            });
                            dirContents = dirDirs.concat(dirFiles);
                            if(reverse){
                                dirContents.reverse();
                            }
                            dirContents.map(function(item, index){
                                item.number = index;    
                            });

                            return cb(null, dirContents);
                        }
                    }
                }
                else if(stats && stats.isDirectory()){
                    item.type = 'directory';
                    dirDirs.push(item); // Directories get unshifted to the beginning of the array.
                    if(index == files.length - 1){
                        dirDirs.sort(function(a, b){
                            return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                        });
                        dirFiles.sort(function(a, b){
                            return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                        });
                        dirContents = dirDirs.concat(dirFiles);
                        if(reverse){
                            dirContents.reverse();
                        }
                        dirContents.map(function(item, index){
                            item.number = index;    
                        });

                        return cb(null, dirContents);
                    }
                }
                else{
                    if(index == files.length - 1){
                        dirDirs.sort(function(a, b){
                            return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                        });
                        dirFiles.sort(function(a, b){
                            return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                        });
                        dirContents = dirDirs.concat(dirFiles);
                        if(reverse){
                            dirContents.reverse();
                        }
                        dirContents.map(function(item, index){
                            item.number = index;    
                        });

                        return cb(null, dirContents);
                    }
                }
            });
        });
    });
}

// composeResults puts together the results for the individual thumbnail page.
// start - from the URL attribute 'start'
// reDir - relative path, used to cache thumbnails
// dirContents - the array of objects created in the getList function
exports.composeResults= function(start, relDir, dirContents, cb){
    var end;
    // Slice the contents down to only 12 results.
    dirContentsSlice = dirContents.slice(start, Number(start) + 12);

    if(dirContents.length <= Number(start) + 12){
        end = true;
    }

    var iterator = dirContentsSlice.length; // This is decremented each time an item is added to the final results array, used to coordinate the 12 async processes.

    var fileResults = [];
    var dirResults = [];
    var results = [];

    dirContentsSlice.map(function(item){
        if(item.type == 'file'){

            var thumbDir = path.join(__dirname, 'public', 'nodegallery_cache', relDir); // This is the cache of thumbnails. It's structure mirrors that of the original image directory.

            item.thumb = path.join('/nodegallery_cache', relDir, item.name + '.png'); // The relative path to the  thumbnail that will be generated (if needed).
            item.thumbAbsolutePath = path.join(thumbDir, item.name + '.png'); // The absolute path to the thumbnail

                mkdirp(thumbDir, function(err){ // Create the directory recursively.
                    if(err){
                        return err;
                    }

                    fs.stat(item.thumbAbsolutePath, function(err, stats){ 
                        if(err){
                            if(err.code == 'ENOENT'){ // Only continue with thumbnail generation if the thumbnail doesn't already exist.
                                if(/\.(webm|mp4)$/.test(item.absolutePath)){ // If the file is a webm video
                                    ffmpeg(item.absolutePath).ffprobe(0, function(err, data){
                                        if(err){
                                            console.error("Cannot generate thumbnail for %s: %s", item.absolutePath, err);
                                            iterator--;
                                            item.thumb = '/images/NoThumb.png';
                                            fileResults.push(item); // Push the item to the final results array.
                                            if(! iterator){ // If there aren't any more images to process, finish up and return the callback.
                                                results = results.concat(dirResults, fileResults);
                                                results.sort(function(a, b){
                                                    return a.number - b.number;
                                                });
                                                if(end){
                                                    results.push('end');
                                                }
                                                return cb(null, results);
                                            }
                                            return;
                                        }
                                        var thumbnailTime;
                                        if(data.streams[0].duration < 6){
                                            thumbnailTime = '00:00:01.0';
                                        }
                                        else{
                                            thumbnailTime = '00:00:05.0';
                                        }
                                        var cropWidth;
                                        var cropHeight;
                                        var scaleWidth;
                                        var scaleHeight;
                                        var cropX;
                                        var cropY;
                                        width = data.streams[0].width;
                                        height = data.streams[0].height;
                                        aspectFactor = height / width;
                                        if(aspectFactor <= 1){ // Landscape
                                            scaleFactor = 150 / height;
                                            cropHeight = 150;
                                            cropWidth = Math.floor(scaleFactor * width) > 200 ? 200 : Math.floor(scaleFactor * width);
                                            cropX = Math.floor(((scaleFactor * width) - cropWidth) / 2);
                                            cropY = 0;
                                            scaleWidth = -1;
                                            scaleHeight = 150
                                        }
                                        else if(aspectFactor > 1){ // Portrait
                                            scaleFactor = 200 / width;
                                            cropHeight = Math.floor(scaleFactor * height) > 150 ? 150 : Math.floor(scaleFactor * height);
                                            cropWidth = 200;
                                            cropX = 0;
                                            cropY = Math.floor(((scaleFactor * height) - cropHeight) / 2);
                                            scaleWidth = 200;
                                            scaleHeight = -1;
                                        }
                                        ffmpeg(item.absolutePath)
                                            // If there's an error generating the thumbnail, use a generic image.
                                            .on('error', function(err, stdout, stderr){
                                                console.error("Cannot generate thumbnail for %s: %s", item.absolutePath, err);
                                                iterator--;
                                                item.thumb = '/images/NoThumb.png';
                                                fileResults.push(item); // Push the item to the final results array.
                                                if(! iterator){ // If there aren't any more images to process, finish up and return the callback.
                                                    results = results.concat(dirResults, fileResults);
                                                    results.sort(function(a, b){
                                                        return a.number - b.number;
                                                    });
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
                                                item = null;
                                                if(! iterator){
                                                    results = results.concat(dirResults, fileResults);
                                                    results.sort(function(a, b){
                                                        return a.number - b.number;
                                                    });
                                                    if(end){
                                                        results.push('end');
                                                    }
                                                    return cb(null, results);
                                                }
                                            })
                                            .seekInput(thumbnailTime) // Get the thumbnail frame from 5 seconds into the video.
                                            .frames(1)
                                            .complexFilter(
                                                ['scale=' + scaleWidth + ':' + scaleHeight + '[rescaled]', 
                                                    {
                                                        filter: 'crop', options: {w: cropWidth, h: cropHeight, x: cropX, y: cropY}, 
                                                        inputs: 'rescaled'
                                                    }
                                                ]
                                            )
                                            .save(item.thumbAbsolutePath);
                                    });
                                }
                                else{ // If the item is not a video, it's an image, so use im to create the thumbnail
                                    im(item.absolutePath)
                                    .size(function (err, features) {
                                        if (err){
                                            console.error("Cannot generate thumbnail for %s: %s", item.absolutePath, err);
                                            iterator--;
                                            item.thumb = '/images/NoThumb.png';
                                            fileResults.push(item);
                                            item = null;
                                            if(! iterator){
                                                results = results.concat(dirResults, fileResults);
                                                results.sort(function(a, b){
                                                    return a.number - b.number;
                                                });
                                                if(end){
                                                    results.push('end');
                                                }
                                                return cb(null, results);
                                            }
                                            return;
                                        }
                                        
                                        if(features.width > features.height){ // If the image is in landscape, make the thumbnail 200px wide.
                                            im(item.absolutePath + '[0]') // '[0]' is used for gifs; it grabs the first frame.
                                            .resize(200, null) 
                                            .crop(200, 150, 0, 0)
                                            .write(item.thumbAbsolutePath, function (err) {
                                                iterator--;
                                                if (err){
                                                    console.error("Cannot generate thumbnail for %s: %s", item.absolutePath, err);
                                                    item.thumb = '/images/NoThumb.png';
                                                    fileResults.push(item);
                                                    item = null;
                                                    if(! iterator){
                                                        results = results.concat(dirResults, fileResults);
                                                        results.sort(function(a, b){
                                                            return a.number - b.number;
                                                        });
                                                        if(end){
                                                            results.push('end');
                                                        }
                                                        return cb(null, results);
                                                    }
                                                    return;
                                                }
                                                fileResults.push(item);
                                                item = null;
                                                if(! iterator){
                                                    results = results.concat(dirResults, fileResults);
                                                    results.sort(function(a, b){
                                                        return a.number - b.number;
                                                    });
                                                    if(end){
                                                        results.push('end');
                                                    }
                                                    return cb(null, results);
                                                }
                                            });
                                        }
                                        else{ // If the image is in portrait, make the thumbnail 200px high.
                                            im(item.absolutePath + '[0]') 
                                            .resize(null, 150)
                                            .write(item.thumbAbsolutePath, function (err) {
                                                iterator--;
                                                if (err){
                                                    console.error("Cannot generate thumbnail for %s: %s", item.absolutePath, err);
                                                    item.thumb = '/images/NoThumb.png';
                                                    fileResults.push(item);
                                                    item = null;
                                                    if(! iterator){
                                                        results = results.concat(dirResults, fileResults);
                                                        results.sort(function(a, b){
                                                            return a.number - b.number;
                                                        });
                                                        if(end){
                                                            results.push('end');
                                                        }
                                                        return cb(null, results);
                                                    }
                                                    return;
                                                }
                                                fileResults.push(item);
                                                item = null;
                                                if(! iterator){
                                                    results = results.concat(dirResults, fileResults);
                                                    results.sort(function(a, b){
                                                        return a.number - b.number;
                                                    });
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
                        else{ // If the thumbnail already exists, it's not re-generated.
                            iterator--;
                            fileResults.push(item);
                            item = null;
                            if(! iterator){
                                results = results.concat(dirResults, fileResults);
                                results.sort(function(a, b){
                                    return a.number - b.number;
                                });
                                if(end){
                                    results.push('end');
                                }
                                return cb(null, results);
                            }
                        }
                    });
                });
        }

        else if(item.type == 'directory'){ // Directories use a generic folder icon, they don't need thumbnails.
            iterator--;
            dirResults.push(item);
            item = null;
            if(! iterator){
                results = results.concat(dirResults, fileResults);
                results.sort(function(a, b){
                    return a.number - b.number;
                });
                if(end){
                    results.push('end');
                }
                return cb(null, results);
            }
        }
    });
}

// cleanup is called by the router after the results are returned and the response is sent.
// It ensures that the thumbnail cache is in sync with the main directory.
// pathname - the path to the current directory
// absPath - the absolute path to the companion directory in the main image directory.
exports.cleanup = function(pathname, absPath){
    
    var thumbDir = path.join(__dirname, 'public', 'nodegallery_cache', pathname);

    fs.readdir(thumbDir, function(err, files){
        if(err || ! files){
            console.error(err);
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
                                if(err){
                                    console.error(err);
                                }
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
