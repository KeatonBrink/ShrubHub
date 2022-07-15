const session = require("express-session");


const setUpSessionStore = function(app) {
    app.use(session({
        //Secret should be in env frankly
        secret: "123",
        resave: false,
        saveUninitialized: false,
    })
    )
};

module.exports = setUpSessionStore
