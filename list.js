var fs = require('fs');
var path = require('path');
var gm = require('gm');
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

        files.map(function(item){
            if(item == undefined || /^\./.test(item) || /\.html$/.test(item) || /^thumbs$/.test(item)){
                return;
            }

            item = { 'name' : item,  'absolutePath' : path.join(dir, item), 'relativePath' : path.join(relDir, item) };

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

        dirContents = dirContents.slice(start, Number(start) + 12);


        dirContents.map(function(item){
            if(item.type == 'file'){
                item.thumb = path.join('/nodegallery_cache', relDir, item.name);

                var thumbDir = path.join(__dirname, 'public', 'nodegallery_cache', relDir);
                    mkdirp(thumbDir, function(err){
                        if(err){
                            return err;
                        }
                        var thumbPath = path.join(__dirname, 'public', item.thumb + '.png');

                        fs.stat(thumbPath, function(err, stats){
                            if(err){
                                if(err.code == 'ENOENT'){
                                    gm(item.absolutePath)
                                    .size(function (err, features) {
                                        if (err){
                                            return err;
                                        }
                                        
                                        if(features.width > features.height){
                                            gm(item.absolutePath + '[0]')
                                            .resize(200, null) 
                                            .write(thumbPath, function (err) {
                                                if (err){
                                                    return err;      
                                                }
                                            });
                                        }
                                        else{
                                            gm(item.absolutePath + '[0]')
                                            .resize(null, 200)
                                            .write(thumbPath, function (err) {
                                                if (err){
                                                    return err;      
                                                }
                                            });
                                        }
                                    });
                                }
                                else{
                                    return err;
                                }
                            }
                            else{
                                return;
                            }
                        });
                    });
                results.push(item);
            }

            else if(item.type == 'directory'){
                results.unshift(item);
            }
        });
        return cb(null, results);
    });
}
