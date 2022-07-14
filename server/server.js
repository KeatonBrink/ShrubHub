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
            // mower or poster
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

app.get("/user/:userid", async (req, res) => {
    let userID = req.params.userid
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    let user;
    let user1;
    try {
        //Find use all the lawn ids found in the user model, and replace them with the corresponding lawns
        user = await User.findById(userID).populate('lawns')
        if (!user) {
            res.status(404).json({
                message: "User could not be found",
            })
            return;
        }
        res.status(200).json(user);
        return;
    } catch(err) {
        res.status(500).json({
            message: "Error finding User",
            error: err,
        })
        return;
    }
    return;
})

app.post("/lawn", async (req, res) => {
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    let updatedUser;
    try {
        let lawn = await Lawn.create({
            user_id: req.user.id,
            description: req.body.description,
            address: req.body.address,
            public: true,
            pay: req.body.pay,
            mowinterval: req.body.mowInterval,
            startdate: req.body.startDate,
            enddate: req.body.endDate,
            //Time 2 mow should be submitted in minutes
            time2mow: req.body.time2Mow,
            haslawnmower: req.body.hasLawnMower,
            hasdogpoop: req.body.hasDogPoop,
            hasfreefood: req.body.hasFreeFood,
            hasfreewater: req.body.hasFreeWater,
        });
        try{
            updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                {
                    $push: {
                        lawns: lawn._id,
                    }
                },
    
                //Return after changes are made
                {
                    new: true,
                }
            )
            if (!updatedUser) {
                res.status(404).json({
                    message: "user not found"
                })
                return;
            }
        } catch(err) {
            res.status(500).json({message: "could not connect lawn to user", error: err,})
        }
        res.status(201).json(lawn);
    } catch(err) {
        res.status(500).json({message: "could not create lawn", error: err,})
    }
    return;
})

app.post("/lawn/:lawnid", async (req, res) => {
    let lawnID = req.params.lawnid
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    let lawn;
    try {
        lawn = Lawn.findById(lawnID);
        if (!lawn) {
            res.status(404).json({
                message: "Lawn could not be found",
            })
            return;
        }
    } catch(err) {
        res.status(500).json({
            message: "Error finding lawn",
            error: err,
        })
        return;
    }
    return;
})

module.exports = app;