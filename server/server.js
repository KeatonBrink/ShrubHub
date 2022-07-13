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
app.post("/user/mower", async (req, res) => {
    try {
        //We will need to update this with emails and other profile requirements
        let user = await User.create({
            username: req.body.username,
            fullname: req.body.fullname,
            // Very bad, the password should be encrypted
            password: req.body.password,
            email: req.body.email,
            // This may be incorrect syntax
            address: {
                street: req.body.street,
                city: req.body.city,
                state: req.body.state,
                zipcode: req.body.zipcode,
            },
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

app.post("/user/lawner", async (req, res) => {
    try {
        //We will need to update this with emails and other profile requirements
        let user = await User.create({
            username: req.body.username,
            fullname: req.body.fullname,
            // Very bad, the password should be encrypted
            password: req.body.password,
            email: req.body.email,
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