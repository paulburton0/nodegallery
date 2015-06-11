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

        files = files.slice(start, Number(start) + 12);
        files.map(function(item){
            if(item == undefined || /^\./.test(item)){
                return;
            }

            else{
                var item = { 'name' : item,  'absolutePath' : path.join(dir, item), 'relativePath' : path.join(relDir, item) };
                
                var fileType = fs.lstatSync(item.absolutePath).isFile();
                var dirType = fs.lstatSync(item.absolutePath).isDirectory();

                if(fileType){
                    item.type = 'file';
                    item.thumb = path.join('/nodegallery_cache', relDir, item.name);

                    mkdirp(path.join(__dirname, 'public', 'nodegallery_cache', relDir), function(err){
                        if(err){
                            return err;
                        }

                        gm(item.absolutePath + '[0]')
                        .size(function (err, features) {
                            if (err){
                                return err;
                            }
                            
                            if(features.width > features.height){
                                gm(item.absolutePath)
                                .resize(200, null) 
                                .write(path.join(__dirname, 'public', item.thumb + '.png'), function (err) {
                                    if (err){
                                        return err;      
                                    }
                                });
                            }
                            else{
                                gm(item.absolutePath + '[0]')
                                .resize(null, 200)
                                .write(path.join(__dirname, 'public', item.thumb + '.png'), function (err) {
                                    if (err){
                                        return err;      
                                    }
                                });
                            }

                        });

                    });
                }

                if(dirType){
                    item.type = 'directory';
                }

                results.push(item);

            }
        });

        return cb(null, results);

    });
}
