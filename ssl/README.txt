Put your SSL cert and key here.
If you're not using a self-signed cert (i.e., you have a ca certificate/chain),
then put that here too.

Here are the configuration options for enabling ssl:

module.exports = { sslKey : 'ssl/private_key.pem',
                   sslCert : 'ssl/certificate.pem',
                   sslCaCert: 'ssl/CA_certificate.pem', <-- leave sslCaCert undefined for self-signed cert.
                   useHttps : true
                 }


