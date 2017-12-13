# Nodegallery  

## What is nodegallery?  

Nodegallery is a simple HTTP/S server that turns any directory with images and videos into a gallery site.  

## What do I need?

In order to use nodegallery, you need a working node.js (of course).  

You will also need [GraphicsMagick](http://graphicsmagick.org) and a version of [FFmpeg](https://ffmpeg.org) that is capable of generating HTML5-compatible  WEBM and/or MP4 (h264/aac) videos. For a good guide on building your own FFmpeg with these capabilites, see FFmpeg's [Compilation Guide](https://trac.ffmpeg.org/wiki/CompilationGuide).  

All the node.js library dependencies are included in this repository.

## How do I use it?  

To use nodegallery, follow these simple steps:  

1. Update settings.js for your application:  

  ```        
    module.exports = { 
                       port : '3000',  <--- the port number you want nodegallery to listen on  
                       sslKey : 'ssl/ssl-cert-snakeoil.key',   <--- the path to your SSL key file  
                       sslCert : 'ssl/ssl-cert-snakeoil.pem',  <--- the path to your SSL certificate file  
                       sslCaCert : 'ssl/ca_cert.pem',  <--- only use this if you have a CA certificate (i.e. if you're not using a self-signed cert.)
                       useHttps : true,       <--- 'true' for HTTPS, undefined or false for HTTP  
                       imageDirectory : '/home/myhomedir/Pictures' <--- The path to your root images directory  
                       useauth: true,       <--- 'true' to require a login to match what's in the auth.js file  
                     }
  ```

2. If you want to use authentication and (rudimentary) access control, add your login credentials to a file named 'auth.js' in the root of the application. The format of the auth.js file is:  

  ```

    module.exports = { 
                        johnuser: {
                                   username: 'johnuser',
                                   password: 'mypassword',
                                   permissions: {
                                                  '/privatepics': 'deny',
                                                  '/videos/private': 'deny'
                                                }
                                 }
                     }
  ```
  Note the leading slash in each directory name. Without it, the permissions will not be propoerly enforced.
  Also note that access controls are only directory-based. To grant a user full access to all directories, use the following:

  ```
    
    permissions: null

  ```

3. Copy the executable nodegallery script to your PATH. Then you can run nodegallery with the command  

  ```
    $ nodegallery start
  ```

  for more information, run the command

  ```
    $ nodegallery help
  ```

  You can name your applcation whatever you want by renaming the executable init script and making sure the $apppath variable at the beginning of that script points to the location of your application.
  
4. You're done. Navigate to your nodegallery to see your pictures and videos.  

## Notes  

Nodegallery will show images in the following formats:  

* JPEG (with extenstion jpg or jpeg)  
* PNG  
* GIF  
* BMP  

Nodegallery will also only include HTML5-compatible WEBM and MP4 videos. Your videos must be converted/transcoded to one of these formats in order to view them in nodegallery.  

Files and directories that start with a '.' (period) will not appear in nodegallery.

It's probably a good idea to avoid directory, image, and video names with nonstandard URL characters in them.
