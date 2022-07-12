const { builtinModules } = require('module');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const {User} = require("../persist/model.js");
const app = require('./server.js');

//This stuff is wild, not sure how it works, but I believe is can be copy and pasted
passport.use(new LocalStrategy(async(username, password, done) => {
    let user;
    try {
        //This will change with password encryption
        //Try to find the user
        user = await User.findOne({username:username, password:password});
        //Did we find anything
        if (!user) {
            return done(null, false);
        }
        // Found Something
        return done(null, user);
    } catch (err) {
        //There was an error while looking
        return done(err);
    }
}))

//Yeah, go ahead and copy this too
const setUpAuth = function (app) {
    app.use(passport.initialize());
    app.use(passport.authenticate("session"));

    passport.serializeUser(function(user, cb) {
        //The following function creats a data type that holds the given data and the cookie it is associated with
        //these parameters will be found in req.user when a client calls in to the api
        cb(null, {id: user._id, username: user.username, fullname: user.fullname, email: user.email, address: user.address})
    });
    passport.deserializeUser(function(user, cb) {
        return cb(null, user);
    });

    app.post("/session", passport.authenticate("local"), (req, res) => (
        res.status(201).json({message: "Succesfully created session"
     } )))
    app.get("/session", (req, res) =>{
        if(!req.user) {
            res.status(401).json({message: "unauthorized"});
            return;
        }
        res.status(200).json({message: "authorized", username: req.user.username, fullname: req.user.fullname});
    })
}

module.exports = setUpAuth;