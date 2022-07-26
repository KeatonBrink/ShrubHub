//Connecting all required files
const express = require('express');
//This may not be hooked up correctly
const {User, Lawn} = require("../persist/model");
const setUpAuth = require("./auth");
const setUpSession = require("./session");
const app = express();
const configg = require('dotenv').config()
var bodyParser = require('body-parser');

/*
Check authenticated
Check authorized
Perform action
*/

//Tell your server to understand how to handle json
app.use(express.json());

//allow serving of UI code
app.use(express.static(`${__dirname}/../public`));

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

setUpSession(app);
setUpAuth(app);

//How the backend handles a create mower request
app.post("/user", async (req, res) => {
    // console.log(req.body)
    try {
        // console.log("1 ", req.body)
        // Take all the data from the front end and create a user
        let user = await User.create({
            username: req.body.username,
            fullname: req.body.fullname,
            password: req.body.password,
            email: req.body.email,
            // address: req.body.address,
            // mower or poster
            defaultrole: req.body.role,
            phonenumber: req.body.phone
        });
        // console.log("2")
        // console.log(user)
        res.status(201).json(user);
        // console.log("3")
        return;
    } catch (err) {
        res.status(500).json({
            message: `post request failed`,
            error: err,
        });
        return;
    }
});

//How the backend handles a create mower request
app.post("/logout", async (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
        });
    //     res.status(200);
    // } catch(err) {
    //     console.log(err);
    //     res.status(500);
    // }
});

app.get("/urls", async (req, res) => {
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    let urls = {
        awsPhotoURL: process.env.AWS_PHOTO_URL,
        IdentityPoolId: process.env.IDENTITY_POOL_ID,
        photoBucketName: process.env.PHOTO_BUCKET_NAME,
        bucketRegion: process.env.BUCKET_REGION,
    }
    res.status(200).json(urls)
})

app.get("/user/:userid", async (req, res) => {
    let userID = req.params.userid
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    let user;
    try {
        //Find use all the lawn ids found in the user model, and replace them with the corresponding lawns
        user = await User.findById(userID, "-password -username").populate('lawns', 'savedlawns')
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
            picture: req.body.image,
            pay: req.body.pay,
            mowinterval: req.body.mowInterval,
            startdate: req.body.startDate,
            //enddate: req.body.endDate,
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

app.patch("/savedlawn", async (req, res) => {
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }

    try {
        let updatedUser;
        try {
            if (req.body.command == 'add') {
                updatedUser = await User.findByIdAndUpdate(
                    req.user.id,
                    {
                        $push: {
                            savedlawns: req.body.lawnid,
                        }
                    },
        
                    //Return after changes are made
                    {
                        new: true,
                    }
                )
            } else {
                updatedUser = await User.findByIdAndUpdate(
                    req.user.id,
                    {
                        $pull: {
                            savedlawns: req.body.lawnid,
                        }
                    },
        
                    //Return after changes are made
                    {
                        new: true,
                    }
                )
            }
            console.log("Lawn " + req.body.command + " " + req.body.lawnid);
            if (!updatedUser) {
                res.status(404).json({
                    message: "user not found"
                })
                return;
            }
        } catch(err) {
            res.status(500).json({message: "could not connect lawn to user", error: err,})
        }
        res.status(201).json(req.body.lawnid);
    } catch(err) {
        res.status(500).json({message: "could not create lawn", error: err,})
    }
    return;
});

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

app.patch("/lawn/:lawnid", async (req, res) => {
    let lawnID = req.params.lawnid;
    let lawnURL = req.body.newLawnImageURL;
    console.log
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    let lawn;
    try {
        lawn = await Lawn.findById(lawnID);
        // console.log(lawn.user_id, " ", req.user.id)
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
            {picture: lawnURL},
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
            message: "failed to change lawn URL",
            error: err
        })
        return;
    }
    res.status(200).json(lawn)
})

app.patch("/updateLawn", async (req, res) => {
    let lawnID = req.body._id
    if(!req.user) {
        res.status(401).json({message: "unauthorized"});
        return;
    }
    let lawn;
    try {
        lawn = await Lawn.findById(lawnID);
        // console.log(lawn.user_id, " ", req.user.id)
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
            {
                description: req.body.description,
                address: req.body.address,
                pay: req.body.pay,
                mowinterval: req.body.mowinterval,
                startdate: req.body.startdate,
                time2mow: req.body.time2mow,
                haslawnmower: req.body.haslawnmower,
                hasdogpoop: req.body.hasdogpoop,
                hasfreefood: req.body.hasfreefood,
                hasfreewater: req.body.hasfreewater
            },
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
            message: "failed to change update lawn",
            error: err
        })
        return;
    }
    res.status(200).json(lawn)
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
        // console.log(lawn.user_id, " ", req.user.id)
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