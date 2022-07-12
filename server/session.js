const session = require("express-session");


const setUpSessionStore = function(app) {
    const config = require("../config")
    app.use(session({
        secret: config.session_key,
        resave: false,
        saveUninitialized: false,
    })
    )
};

module.exports = setUpSessionStore
