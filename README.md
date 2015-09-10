#Nodegallery  
##What is nodegallery?  
Nodegallery is a simple HTTP/S server that turns any directory with images and videos into a gallery site.  

##How do I use it?  
To use nodegallery, follow these simple steps:  
1. Update settings.js for your application:  

  ```        
    module.exports = { port : '3000',  <--- the port number you want nodegallery to listen on  
                               sslKey : 'ssl/ssl-cert-snakeoil.key',   <--- the path to your SSL key file  
                               sslCert : 'ssl/ssl-cert-snakeoil.pem',  <--- the path to your SSL certificate file  
                               useHttps : true,       <--- 'true' for HTTPS, undefined or false for HTTP  
                               imageDirectory : '/home/pburton/imagesx' <--- The path to your root images directory  
                               useauth: true,       <--- 'true' to require a login to match what's in the auth.js file  
                     }
  ```

2. Add your login credentials to a file named 'auth.js' in the root of the application. The format of the auth.js file is:  

  ```
    module.exports = { username: 'username',  
                       password: 'password'  
                     }  
  ```

3. Run nodegallery with the command  

  ```
    $ node bin/www  
  ```

4. You're done. Navigate to your nodegallery to see your pictures and videos.  

##Notes  
Nodegallery will show images in the following formats:  
* JPEG (with extenstion jpg or jpeg)  
* PNG  
* GIF  
* BMP  

Nodegallery will also only include HTML 5-compatible WEBM and MP4 videos. Your videos must be converted/transcoded to one of these formats in order to view them in nodegallery.  

Files and directories that start with a '.' (period) will not appear in nodegallery.  

It's probably a good idea to avoid directory, image, and video names with nonstandard URL characters in them.
