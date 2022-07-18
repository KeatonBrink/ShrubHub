//Connecting all required files
const express = require('express');
//This may not be hooked up correctly
const {User, Lawn} = require("../persist/model");
const setUpAuth = require("./auth");
const setUpSession = require("./session");
const app = express();
const configg = require('dotenv').config()

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
            // mower or poster
            defaultrole: req.body.role,
            phonenumber: req.body.phone
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

app.get("/mapurl", async (req, res) => {
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    res.status(201).json(process.env.GOOGLE_API_KEY);
});

app.get("/user/:userid", async (req, res) => {
    let userID = req.params.userid
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    let user;
    try {
        //Find use all the lawn ids found in the user model, and replace them with the corresponding lawns
        user = await User.findById(userID, "-password -username").populate('lawns')
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

app.get("/lawn/:lawnid", async (req, res) => {
    let lawnID = req.params.lawnid
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    let lawn;
    try {
        lawn = await Lawn.findById(lawnID);
        if (!lawn) {
            res.status(404).json({
                message: "Lawn could not be found",
            })
            return;
        }
        res.status(200).json(lawn);
    } catch(err) {
        res.status(500).json({
            message: "Error finding lawn",
            error: err,
        })
        return;
    }
    return;
})

app.get("/lawns", async (req, res) => {
    let lawns
    try {
        console.log("Start lawn try")
        lawns = await Lawn.find();
        console.log(lawns);
        res.status(200).json(lawns);
    } catch(err) {
        res.status(500).json({
            message: "Error finding lawn",
            error: err,
        })
        return;
    }
    return;
})

app.patch("/lawn/:lawnid/:newPublicity", async (req, res) => {
    let lawnID = req.params.lawnid;
    let isPublic = req.params.newPublicity;
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    let lawn;
    try {
        lawn = await Lawn.findById(lawnID);
        console.log(lawn.user_id, " ", req.user.id)
        if (lawn.user_id != req.user.id) {
            res.status(403).json({
                message: "The user is not owner of lawn"
            })
            return;
        }
    } catch(err) {
        res.status(404).json({
            message: "Lawn could not be found",
            error: err,
        })
        return;
    }
    try {
        lawn = await Lawn.findByIdAndUpdate(
            lawnID,
            {public: isPublic},
            //Return after changes are made
            {
                new: true,
            }
        )
        if (!lawn) {
            res.status(404).json({
                message: "Lawn not found"
            })
            return;
        }
    } catch(err) {
        res.status(500).json({
            message: "failed to change close/open lawn",
            error: err
        })
        return;
    }
    res.status(200).json(lawn)
})

module.exports = app;