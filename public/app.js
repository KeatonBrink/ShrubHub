var MAP;
var GEOCODER;

// disables poi's (Points of Interest)
const myStyles = [
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
              { visibility: "off" }
        ]
    }
];

const URL = "http://localhost:8080"

var app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        page: "landing-page",

        currentUserID: null,
        currentLawn: null,
        targetUser: null,
        targetLawn: null,
        allLawns: null,

        mapsAPIKey: null,

        usernameInput: "",
        passwordInput: "",

        newUsernameInput: "",
        newPasswordInput: "",
        newPasswordInput2: "",
        newFullNameInput: "",
        newEmailInput: "",
        newPhoneInput: "",
        //newProfilePic: "",
        newDefaultRole: "",

        
        newLawnAddress: "",
        newLawnTime2Mow: "",
        newLawnImage: "",
        newLawnPay: "",
        newLawnDescription: "",
        newLawnStartDate: "",
        newRepeatInterval_number: "",
        newRepeatInterval_dayweek: "",
        newLawnEndDate: "",
        dontRepeatBox: false,
        newLawnMowInterval: "",
        
        newLawnHasLawnMower: false,
        newLawnHasDogPoop: false,
        newLawnHasFreeFood: false,
        newLawnHasFreeWater: false,

        mowerView: false,
        posterView: false,

        minimumPayFilter: 0,
        maximumPayFilter: 1000,
        minimumJobDurationFilter: 0,
        maximumJobDurationFilter: 10,
        dayOfWeekFilter: {
            'Sunday': false,
            'Monday': false,
            'Tuesday': false,
            'Wednesday': false,
            'Thursday': false,
            'Friday': false,
            'Saturday': false
        },
        startDateFilter: '',
        startDateFilterReveal: false,
        lawnmowerProvidedFilter: false,

        date1: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        dayWeek: ["days", "weeks"],
        repeatIntervalInput: [1,2,3,4,5,6,7,8,9,10,11,12,13],

        map: null,
        geocoder: null,
        // displays a placeholder if false
        mapIsInitialized: false,
        // if you want to look at the most recent marker object in the console:
        recentMarker: null,
        addressInput: "",
    },

    methods: {
        getSession: async function () {
            console.log("Commencing getSession...");
            let response = await fetch(`${URL}/session`, {
                method: "GET",
                credentials: "include"
            });
            if (response.status == 200) {
                this.targetUser = await response.json();
                this.currentUserID = this.targetUser.ID
                console.log("Log In Successful");
                this.page = "profile-page";
                return
            } else if (response.status == 401) {
                console.log("No User signed in.");
            } else {
                console.log("Error logging in, status: " + response.status);
            }
        },
        
         //GET User
        getUser: async function (userID) {
            let response = await fetch(URL + "/user/" + userID, {
                //Never put body in get request
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //Parse response data
            let body = await response.json();

            //Check for successful creation
            if (response.status == 200) {
                //Succesful creation
                this.targetUser = body;
                console.log("Successful user get");
                this.page = "profile-page";
            } else if (response.status >= 400) {
                console.log("Unsuccesful get user")
            } else {
                console.log("Some sort of error when GET /user/:id");
            }
        },

        postSession: async function () {
            if (this.usernameInput == "" || this.passwordInput == "") {
                console.log("Username or Password field is empty");
                return
            }
            let loginCredentials = {
                username: this.usernameInput,
                password: this.passwordInput
            };
            let response = await fetch(URL + "/session", {
                method: "POST",
                body: JSON.stringify(loginCredentials),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //Check for successful login
            if (response.status == 201) {
                console.log("Successful login attempt ");
                //This is a terrible idea, I think
                await this.getSession();
                console.log(this.currentUserID);
                this.getUser(this.currentUserID);
            } else if (response.status == 401) {
                console.log("Unsuccesful login attempt")
                this.passwordInput = "";
            } else {
                console.log("Some sort of error when POST /session. Error details: "+response.status+" "+response);
            }
        },

        postUser: async function () {
            if (this.newUsernameInput == null) {
                console.log("Please insert a username.");
                return
            } else if (this.newPasswordInput == null) {
                console.log("Please insert a password");
                return
            } else if (this.newPasswordInput != this.newPasswordInput2) {
                console.log("Password inputs do not match. Re-type your password.");
                return
            } else if (this.newDefaultRole == null) {
                console.log("Please select a mowing or posting role.");
                return
            } else if (this.newEmailInput == null) {
                console.log("Please insert a valid email address.");
                return
            } else if (this.newPhoneInput == null) {
                console.log("Please insert a valid phone number");
                return
            } else if (this.newPhoneInput == null) {
                console.log("Please insert a valid phone number");
                return
            //Once user passes all checks, and no fields are null...
            } else {
                let userCredentials = {
                    "username" : this.newUsernameInput,
                    "password" : this.newPasswordInput,
                    "fullname" : this.newFullNameInput,
                    "role" : this.newDefaultRole,
                    "email" : this.newEmailInput,
                    "phone" : this.newPhoneInput,
                }
                let response = await fetch(URL + "/user", {
                    method: "POST",
                    body: JSON.stringify(userCredentials),
                    headers: {
                        "Content-Type" : "application/json"
                    },
                    credentials: "include"
                });
                
                if (response.status == 500) {
                    console.log("Username or email already taken. Please provide a new username.")
                    console.log("Response status is "+response.status+". More info: "+response)
                    return
                } else if (response.status == 404) {
                    console.log("Coding error. 404 result.")
                    console.log("Response status is "+response.status+". More info: "+response)
                    return
                } else {
                    this.page = "login-page"
                    console.log("Account credentials valid. Account Created.");
                    return
                }
            }
        },

        //GET lawns
        getLawns: async function () {
            let response = await fetch(URL + "/lawns", {
                //Never put body in get request
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //Parse response data
            let body = await response.json();

            //Check for successful creation
            if (response.status == 200) {
                //Succesful creation
                this.allLawns = body;
                console.log("Successful lawns get");
                this.page = "mowermain";
            } else if (response.status >= 400) {
                console.log("Unsuccesful get lawns")
            } else {
                console.log("Some sort of error when GET /lawns");
            }
        },

        getLawn: async function (lawnID) {
            let response = await fetch(URL + "/lawn/" + lawnID, {
                //Never put body in get request
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //Parse response data
            let body = await response.json();

            //Check for successful get request
            if (response.status >= 200 && response.status < 300) {
                //Succesful lawn get
                this.targetLawn = body;
                console.log("Successful lawn get");
            } else if (response.status >= 400) {
                console.log("Unsuccesful get lawn")
            } else {
                console.log("Some sort of error when GET /lawn/:id");
            }
        },
        
        

        postLawn: async function () {
            if (this.newLawnDescription == "") {
                console.log("Please add a description.");
                return
            } else if (this.newLawnAddress == "") {
                console.log("Please insert a valid address");
                return
            } else if (this.newLawnPay == "") {
                console.log("Please insert a pay scale for this job.");
                return
            } else if (this.newLawnStartDate == "") {
                console.log("Please pick a start date");
                return
            } else if (this.newRepeatInterval_dayweek == "" || this.newRepeatInterval_number == "") {
                console.log("Please select your mow interval");
                return
            // } else if (this.newLawnEndDate == "") {
            //     console.log("Please pick an end date.");
            //     return
            } else if (this.newLawnTime2Mow == "") {
                console.log("Please verify how long it takes to mow your lawn.");
                return
            }
            //Once user passes all checks, and no fields are null...
            let lawnSpecifics = {
                "address" : this.newLawnAddress,
                "time2Mow": this.newLawnTime2Mow,
                "image" : this.newLawnImage,
                "pay" : this.newLawnPay,
                "description" : this.newLawnDescription,
                "startDate" : this.newLawnStartDate,
                "mowInterval" : this.newRepeatInterval_number+" "+this.newRepeatInterval_dayweek,

                // "endDate" : this.newLawnEndDate,
                "hasLawnMower": this.newLawnHasLawnMower,
                "hasDogPoop": this.newLawnHasDogPoop,
                "hasFreeFood": this.newLawnHasFreeFood,
                "hasFreeWater": this.newLawnHasFreeWater,
            }
            let response = await fetch(URL + "/lawn", {
                method: "POST",
                body: JSON.stringify(lawnSpecifics),
                headers: {
                    "Content-Type" : "application/json"
                },
                credentials: "include"
            });

            //Parse response data
            let body = await response.json();
            
            //Check for successful creation
            if (response.status >= 200 && response.status < 300) {
                //Succesful creation
                this.newLawnDescription = "";
                this.newLawnAddress = "";
                this.newLawnPay = "";
                this.newLawnStartDate = "";
                this.newLawnEndDate = "";
                this.newLawnTime2Mow = "";
                this.newLawnMowInterval = "";
                this.newLawnHasLawnMower = false;
                this.newLawnHasDogPoop = false;
                this.newLawnHasFreeFood = false;
                this.newLawnHasFreeWater = false;
                this.getUser(currentUser._id);
                console.log("Successful lawn attempt");
            } else if (response.status >= 400) {
                console.log ("Unsuccesful lawn creation attempt");
            } else {
                console.log("Some sort of error when POST /lawn: "+response.status+response);
            }
        },

        // Switch a lawn from public to private or private to public
        patchLawnPublicity: async function (lawnID, newState) {
            let newURL = URL + "/thread/" + lawnID + "/" + newState;
            console.log(newURL);
            let response = await fetch(newURL, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            if (response.status >= 200 && response.status < 300) {
                //Succesful update
                if (this.page == "profile-page") {
                    this.getUser(this.currentUser._id)
                }
                console.log("Successful patch attempt");
            } else if (response.status >= 400) {
                console.log ("Unsuccesful PATCH /lawn")
            } else {
                console.log("Some sort of error when PATCH /lawn");
            }
        },
        
        toggleDayFilter: function (day) {
            if (this.dayOfWeekFilter[day]) {
                this.dayOfWeekFilter[day] = false;
            } else {
                this.dayOfWeekFilter[day] = true;
            }
            console.log(day + ': ' + this.dayOfWeekFilter[day]);
            return this.dayOfWeekFilter
        },
    },

    created: function () {
        this.getSession();
    }
            
});