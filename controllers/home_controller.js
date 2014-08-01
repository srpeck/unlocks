function getIndex(req, res) {
    // TODO: Update route handler for browser client functionality and user registration/login
    return res.sendfile("public/index.html");
}

module.exports = { 'getIndex': getIndex };
