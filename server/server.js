//Connecting all required files
const express = require('express');
//This may not be hooked up correctly
const {User, Lawn} = require("../persist/model");
const setUpAuth = require("./auth");
const setUpSession = require("./session");
const app = express();

/*
Check authenticated
Check authorized
Perform action
*/

//Tell your server to understand how to handle json
app.use(express.json());

//allow serving of UI code
app.use(express.static(`${__dirname}/../public`));

setUpSession(app);
setUpAuth(app);

//How the backend handles a create mower request
app.post("/user", async (req, res) => {
    try {
        // Take all the data from the front end and create a user
        let user = await User.create({
            username: req.body.username,
            fullname: req.body.fullname,
            password: req.body.password,
            email: req.body.email,
            address: req.body.address,
            defaultrole: req.body.role
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({
            message: `post request failed`,
            error: err,
        });
        return;
    }
});

module.exports = app;