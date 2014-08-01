var User = require('../models/user_model');

// Simple regex validator for email address - http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
function validEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validUsername(username) {
    var re = /\w{3,50}/;
    return re.test(username);
}

function validPassword(password) {
    var re = /.{6,50}/;
    return re.test(password);
}

function postUser(req, res) {
    if(!req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('password') || !req.body.hasOwnProperty('email')) {
        return res.send(400, 'Error 400: Post syntax incorrect.');
    } else if(!validUsername(req.body.username) || !validPassword(req.body.password) || !validEmail(req.body.email)) {
        // Validate that username, password, and email follow business rules
        return res.send(400, 'Error 400: Invalid content.');
    } else {
        // Insert new user information
        User.insertUser(req.body.username, req.body.password, req.body.email, function(err, result) {
            if(err) {
                console.error('Error writing to database.', err);
                return res.send(400, 'Error 400: Bad request.');
            } else {
                return res.send(200);
            }
        });
    }
}

function getUnlocks(req, res) {
    User.findUnlocksByUsername(req.user.username, function(err, result){
        if(err) {
            console.error('Error finding unlocks by username.', err);
            return res.send(500, 'Internal server error.');
        } else {
            return res.send(result);
        }
    });
}

function putUser(req, res) {
    // Do I really want to update both password and email every time? Or just the one that is new?
    if(!req.body.hasOwnProperty('password') || !req.body.hasOwnProperty('email')) {
        return res.send(400, 'Error 400: Post syntax incorrect.');
    } else if(!validPassword(req.body.password) || !validEmail(req.body.email)) {
        // Validate that password and email follow business rules
        return res.send(400, 'Error 400: Invalid content.');
    } else {
        // Update user information
        User.updateUser(req.user.username, req.body.password, req.body.email, function(err, result) {
            if(err) {
                console.error('Error writing to database.', err);
                return res.send(400, 'Error 400: Bad request.');
            } else {
                return res.send(200, { username: req.user.username, email: req.user.email });
            }
        });
    }
}

module.exports = {  'postUser': postUser,
                    'getUnlocks': getUnlocks,
                    'putUser': putUser };
