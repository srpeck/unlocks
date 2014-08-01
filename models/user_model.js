var pg = require('pg');
var bcrypt = require('bcryptjs');

// connection string in .env, password in .pgpass
// .env file does not work on Windows, so including local default
var dbConnectionString = process.env.DATABASE_CONNECTION_STRING || "postgres://chess@localhost:5432/chess"; 

function comparePasswords(password, dbPassword, callback) {
    // Compare password hashes
    bcrypt.compare(password, dbPassword, function(err, res) {
        if(err) { 
            console.error('Error comparing passwords', err);
            return callback(err, null);
        } else {
            return callback(null, res);
        }
    });
}

function findByUsername(username, callback) {
    pg.connect(dbConnectionString, function(err, dbClient, done) {
        if(err) {
            done();
            console.error('Error fetching client from pool.', err);
            return callback(err, null);
        }
        dbClient.query("SELECT id, username, password, email FROM \"Users\" WHERE username=$1;", [username], function(err, result) {
            done(); // release dbClient back to the pool

            if(err) {
                console.error('Error running query.', err);
                return callback(err, null);
            } else if(!result.rows[0]) {
                console.log('Undefined result.');
                return callback(null, null);
            } else {
                console.log(result.rows[0]);
                return callback(null, result.rows[0]);
            }
        });
    });
}

function findUnlocksByUsername(username, callback) {
    pg.connect(dbConnectionString, function(err, dbClient, done) {
        if(err) {
            done();
            console.error('Error fetching client from pool.', err);
            return callback(err, null);
        }
        dbClient.query("SELECT \"Users\".username, \"Unlocks\".unlock_code FROM \"Users\", \"Unlocks\" WHERE \"Unlocks\".user_id = \"Users\".id AND \"Users\".username=$1;", [username], function(err, result) {
            done(); // release dbClient back to the pool

            if(err) {
                console.error('Error running query.', err);
                return callback(err, null);
            } else if(!result.rows[0]) {
                console.log('Undefined result.');
                return callback(null, null);
            } else {
                console.log(result.rows);
                return callback(null, result.rows);
            }
        });
    });
}

function insertUser(username, password, email, callback) {
    // Hash password + salt and store user information in db
    bcrypt.hash(password, 10, function(err, hash) {
        if(err) {
            console.error('Error encrypting password.', err);
            return callback(err, null);
        } else {
            pg.connect(dbConnectionString, function(err, dbClient, done) {
                // update error handling to match? https://github.com/brianc/node-postgres/wiki/Example
                if(err) {
                    done();
                    console.error('Error fetching client from pool.', err);
                    return callback(err, null);
                } else {
                    dbClient.query("INSERT INTO \"Users\" (username, password, email) VALUES ($1, $2, $3)", [username, hash, email], function(err, result) {
                        done(); // release dbClient back to the pool

                        if(err) {
                            console.error('Error running query.', err);
                            return callback(err, null);
                        } else {
                            console.log(result);
                            return callback(null, result);
                        }
                    });
                }
            });
        }
    });
}

function updateUser(username, password, email, callback) {
    // Hash password + salt and store user information in db
    bcrypt.hash(password, 10, function(err, hash) {
        if(err) {
            console.error('Error encrypting password.', err);
            return callback(err, null);
        } else {
            pg.connect(dbConnectionString, function(err, dbClient, done) {
                // update error handling to match? https://github.com/brianc/node-postgres/wiki/Example
                if(err) {
                    done();
                    console.error('Error fetching client from pool.', err);
                    return callback(err, null);
                } else {
                    dbClient.query("UPDATE \"Users\" SET password=$1, email=$2 WHERE username=$3", [hash, email, username], function(err, result) {
                        done(); // release dbClient back to the pool

                        if(err) {
                            console.error('Error running query.', err);
                            return callback(err, null);
                        } else {
                            console.log(result);
                            return callback(null, result);
                        }
                    });
                }
            });
        }
    });
}

module.exports = {  'comparePasswords': comparePasswords,
                    'findByUsername': findByUsername,
                    'findUnlocksByUsername': findUnlocksByUsername,
                    'insertUser': insertUser,
                    'updateUser': updateUser };
