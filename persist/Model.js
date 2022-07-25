const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    fullname: {type: String, required: true},
    //Consider adding roles (potentially a boolean "Admin: {type: Boolean, required: true, default: false}")
    //Should be encrypted Use bcrypt
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    address: {type: String, required: false, default: ""},
    //  This will be edited when we figure out how to add picture files to a schema
    profilepic: {},
    // lawns: {type: lawnSchema, required: true, default: []},
    phonenumber: {type: String, required: true, default: ""},
    lawns: [{type: mongoose.Schema.Types.ObjectID,
        ref: "Lawn",
        required: false,
        default: [],
    }],
    savedlawns: [{type: mongoose.Schema.Types.ObjectID,
        ref: "Lawn",
        required: false,
        default: [],
    }],
    defaultrole: {type: String, required: true},
    // mowerreviews: {type: reviewSchema, required: true, default: []},
    // posterreview: {rype: reviewSchema, required: true, default: []},
    },
    {timestamps: true},
);

// const addressSchema = mongoose.Schema({
//     street: {type: String, required: true},
//     city: {type: String, required: true},
//     state: {type: String, required: true},
//     zipcode: {type: String, required: true},
//     // It would probably be best just to run a function on the front end for this
//     // googleURL: {type: String, required: true}
// });

const lawnSchema = mongoose.Schema({
    description: {type: String, required: false, default: ""},
    address: {type: String, required: true, default: ""},
    user_id: {
        type: mongoose.Schema.Types.ObjectID,
        ref: "User",
        required: true,
    },
    public: {type: Boolean, required: true, default: false},
    // Picture needed here
    picture: {type: String, required: false, default: ""},
    pay: {type: String, required: true, default: 0},
    // We can either change type, or use a parser on the api
    mowinterval: {type: String, required: false, default: ""},

// look to this line for a date error

    startdate: {type: String, required: true, default: new Date()},
    //endDate: {type: Date, required: true, default: new Date},
    //Lets plan on time to mow being in minutes
    time2mow: {type: String, required: true, default: 10},
    haslawnmower: {type: Boolean, required: false, default: false},
    hasdogpoop: {type: Boolean, required: false, default: false},
    hasfreefood: {type: Boolean, required: false, default: false},
    hasfreewater: {type: Boolean, required: false, default: false},
    },
    {timestamps: true},
);

// const reviewSchema = mongoose.Schema({
//     user_id: {
//         type: mongoose.Schema.Types.ObjectID,
//         ref: "User",
//         required: true,
//     },
//     reviewscore: {type: Number, required: true, default: 5},
//     subjectreview: {type: String, required: true, default: "Lawn"},
//     description: {type: String, required: true, default: ""},
//     reviewer_id: {
//         type: mongoose.Schema.Types.ObjectID,
//         ref: "User",
//         required: true,
//     }
// })

const User = mongoose.model("User", userSchema);
const Lawn = mongoose.model("Lawn", lawnSchema);

module.exports = { 
    User,
    Lawn,
};