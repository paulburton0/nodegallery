#Nodegallery  
##What is nodegallery?  
Nodegallery is a simple HTTPS server that turns any directory with images and videos into a gallery site.  

##How do I use it?  
To use nodegallery, follow these simple steps:  
1. Update settings.js for your application:  

  ```        
  module.exports = { port : '3000',  <--- the port number you want nodegallery to listen on  
                             sslKey : 'ssl/ssl-cert-snakeoil.key',   <--- the path to your SSL key file  
                             sslCert : 'ssl/ssl-cert-snakeoil.pem',  <--- the path to your SSL certificate file  
                             useHttps : true,       <--- 'true' for HTTPS, undefined or false for HTTP  
                             imageDirectory : '/home/pburton/imagesx' <--- The path to your root images directory  
                          }
  ```

2. Add your login credentials to a file named 'auth.js' in the root of the application. The format of the auth.js file is:  

  ```
    module.exports = { username: 'username',  
                             password: 'password'  
                        }  
  ```

3. In the 'public' directory, add a symbolic link to the directory containing the images/videos you want to display in your gallery (the link must point to the directory defined in 'imageDirectory' in step 1).  
4. Run nodegallery with the command  

  ```
    $ node bin/www  
  ```

5. You're done. Navigate to your nodegallery to see your pictures and videos.  

##Notes  
Nodegallery will show images in the following formats:  
* JPEG (with extenstion jpg or jpeg)  
* PNG  
* GIF  
* BMP  

Nodegallery will also only include WEBM videos. Your videos mmust be converted to WEBM in order to view them in nodegallery.  

Files and directories that start with a '.' (period) will not appear in nodegallery.  

It's probably a good idea to avoid image and video files with spaces and nonstandard URL characters in them.  
