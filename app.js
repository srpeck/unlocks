var fs = require('fs');
var express = require('express');
var http = require('http');
var https = require('https');
var passport = require('passport');

// SSL key generation (https://github.com/jugglinmike/passportjs-experiment):
// openssl genrsa -out privatekey.pem 1024 
// openssl req -new -key privatekey.pem -out certrequest.csr 
// openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
var SSL_CREDENTIALS = { key: fs.readFileSync('./ssl_credentials/privatekey.pem').toString(),
                        cert: fs.readFileSync('./ssl_credentials/certificate.pem').toString() };
// Load controllers
var userController = require('./controllers/user_controller');
var homeController = require('./controllers/home_controller');

// Passport configuration
var passportConfig = require('./config/passport_config');

// Create Express server
var app = express();

// Configure Express
app.set('port', process.env.PORT || 3000);
app.set('ssl_port', process.env.SSL_PORT || 3001);
app.use(express.logger());
app.use(express.json());

// Force all http traffic to redirect through https
// IMPORTANT: Any cookies used must be marked secure when sent
// http://stackoverflow.com/questions/15813677/https-redirection-for-all-routes-node-js-express-security-concerns
app.use(function(req, res, next) {
    if(!req.secure) {
        //return res.redirect(['https://', req.get('host'), req.url].join('')); // This http to https redirect, though faster, does not work unless the ports are 80 and 443 (i.e., Production)
        return res.redirect(['https://', req.get('host').split(':')[0], ':', app.get('ssl_port'), req.url].join(''));
    }
    next();
});

// Initialize Passport!  Note: no need to use session middleware when each
// request carries authentication credentials, as is the case with HTTP Basic.
app.use(passport.initialize());
app.use(app.router);

// Static should come after app.router so static files do not break defined routes http://stackoverflow.com/questions/12695591/node-js-express-js-how-does-app-router-work
app.use(express.static(__dirname + '/public'));

// Application routes
// Does not require user authentication
app.get('/', homeController.getIndex);

// Does not require user authentication
// curl -k -v -X POST -H "Content-Type: application/json" -d '{"username":"test5", "password":"testing", "email":"test@test.com"}' http://127.0.0.1:3000/api/user
app.post('/api/user', userController.postUser);

// Requires user authentication
// curl -k -v --user test5:testing -X PUT -H "Content-Type: application/json" -d '{"username":"test5", "password":"testing", "email":"test@test.com"}' http://127.0.0.1:3000/api/user
app.put('/api/user',
    // Authenticate using HTTP Basic credentials, with session support disabled.
    passport.authenticate('basic', { session: false }),
    userController.putUser);

// Requires user authentication
// curl -k -v -I http://127.0.0.1:3000/api/unlocks
// curl -k -v -I --user test5:testing http://127.0.0.1:3000/api/unlocks
app.get('/api/unlocks',
    // Authenticate using HTTP Basic credentials, with session support disabled.
    passport.authenticate('basic', { session: false }),
    userController.getUnlocks);

// Requires listening for http requests to redirect to https
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express http server listening on port %d in %s mode", app.get('port'), app.settings.env);
});
https.createServer(SSL_CREDENTIALS, app).listen(app.get('ssl_port'), function() {
    console.log("Express https server listening on port %d in %s mode", app.get('ssl_port'), app.settings.env);
});
