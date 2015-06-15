var fs = require('fs');
var path = require('path');
var gm = require('gm');
var ffmpeg = require('fluent-ffmpeg');
var mkdirp = require('mkdirp');

var exports = module.exports = {};

exports.getList = function(dir, relDir, start, cb){

    var results = [];

    fs.readdir(dir, function(err, files){
        if(err){
            return cb(err);
        }

        var dirContents = [];
        var item = {};

        files.map(function(item, index){
            item = { 'name' : item,  'absolutePath' : path.join(dir, item), 'relativePath' : path.join(relDir, item) };
            
            if(item.name == undefined || /^\./.test(item.name) || /\.html$/.test(item.name) || /^thumbs$/.test(item.name)){
                return;
            }

            if(fs.statSync(item.absolutePath).isFile() && ! /\.(jpe?g|png|gif|bmp|webm)/i.test(item.name)){
                return;
            }


            var fileType = fs.statSync(item.absolutePath).isFile();
            var dirType = fs.statSync(item.absolutePath).isDirectory();

            if(fileType){
                item.type = 'file';
                dirContents.push(item);
            }
            else{
                item.type = 'directory';
                dirContents.unshift(item);
            }
            
        })

        dirContentsSlice = dirContents.slice(start, Number(start) + 12);

        if(! dirContents[Number(start) + 13]){
            end = true;
        }
        else{
            end = false;
        }


        var iterator = dirContentsSlice.length;

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
                                                if(! iterator){
                                                    if(end){
                                                        results.push('end');
                                                    }
                                                    return cb(null, results);
                                                }
                                                return;
                                            })
                                            .on('end', function(){
                                                iterator--;
                                                results.push(item);
                                                if(! iterator){
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
                                                results.push(item);
                                                if(! iterator){
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
                                                        results.push(item);
                                                        if(! iterator){
                                                            if(end){
                                                                results.push('end');
                                                            }
                                                            return cb(null, results);
                                                        }
                                                        return;
                                                    }
                                                    results.push(item);
                                                    if(! iterator){
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
                                                        results.push(item);
                                                        if(! iterator){
                                                            if(end){
                                                                results.push('end');
                                                            }
                                                            return cb(null, results);
                                                        }
                                                        return;
                                                    }
                                                    results.push(item);
                                                    if(! iterator){
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
                                results.push(item);
                                if(! iterator){
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
                results.unshift(item);
                if(! iterator){
                    if(end){
                        results.push('end');
                    }
                    return cb(null, results);
                }
            }
        });
    });
}
