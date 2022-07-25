
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

        logInputError:"",
        createAccError:"",
        postLawnError:"",
        postedOrSaved:"posted",
        
        currentUserID: null,
        currentUserFullName: null,
        currentLawn: null,
        targetUser: null,
        targetLawn: null,
        allLawns: null,

        mapsAPIKey: null,

        //Sorry, this is a terrible name now
        awsURLs: null,
        IdentityPoolId: null,
        bucketRegion: null,
        photoBucketName: null,

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

        //input boxes
        newLawnAddress: "",
        newLawnTime2Mow: "",
        newLawnImageURL: "",
        newLawnPay: "",
        newLawnDescription: "",
        //date selector and dropdown boxes
        newLawnStartDate: "",
        newRepeatInterval_number: "",
        newRepeatInterval_dayweek: "",
        //checkboxes
        dontRepeatBox: false,
        newLawnHasLawnMower: false,
        newLawnHasDogPoop: false,
        newLawnHasFreeFood: false,
        newLawnHasFreeWater: false,

        //variable for combination of newRepeatInterval_number and newRepeatInterval_dayweek 
        newLawnMowInterval: "",

        mowerView: false,
        posterView: false,

        //filter variables
        minimumPayFilter: 0,
        maximumPayFilter: 1000,
        minimumJobDurationFilter: 0,
        maximumJobDurationFilter: 10,
        dayOfWeekFilter: {
            'Sunday': true,
            'Monday': true,
            'Tuesday': true,
            'Wednesday': true,
            'Thursday': true,
            'Friday': true,
            'Saturday': true
        },
        startDateFilter: (new Date(Date.now() - (new Date()).getTimezoneOffset())).toISOString().substr(0, 10),
        startDateFilterReveal: false,
        lawnmowerProvidedFilterReveal: false,
        lawnmowerProvidedFilter: null,

        date1: (new Date(Date.now() - (new Date()).getTimezoneOffset())).toISOString().substr(0, 10),
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
                // console.log(this.targetUser.fullname)
                this.currentUserFullName = this.targetUser.fullname
                this.getUser(this.currentUserID);
                this.getURLs()
                console.log("Log In Successful");
                this.page = "profile-page";
                return
            } else if (response.status == 401) {
                console.log("No User signed in.");
            } else {
                console.log("Error logging in, status: " + response.status);
            }
        },

        getURLs: async function () {
            let response = await fetch(`${URL}/urls`, {
                method: "GET",
                credentials: "include"
            });
            if (response.status == 200) {
                this.awsURLs = await response.json();
                this.photoBucketName = this.awsURLs.photoBucketName;
                this.bucketRegion = this.awsURLs.bucketRegion;
                this.IdentityPoolId = this.awsURLs.IdentityPoolId
                AWS.config.update({
                    region: this.bucketRegion,
                    credentials: new AWS.CognitoIdentityCredentials({
                      IdentityPoolId: this.IdentityPoolId
                    })
                  });
                  
                  var s3 = new AWS.S3({
                    apiVersion: "2006-03-01",
                    params: { Bucket: this.photoBucketName }
                  });
            } else {
                console.log("urls not delivered")
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
            
                this.targetUser = body;
                console.log("Successful user get");
                this.$forceUpdate();
                if (response.status == 200) {
                //Succesful creation
                if(this.currentUserID == this.targetUser._id){
                    this.screenDelay(1.5, 'profile-page');
                } else {
                    this.screenDelay(1.5, 'target-profile-page');
                }
                
            } else if (response.status >= 400) {
                console.log("Unsuccesful get user")
            } else {
                console.log("Some sort of error when GET /user/:id");
            }
        },

        postSession: async function () {
            if (this.usernameInput == "" || this.passwordInput == "") {
                console.log("Username or Password field is empty");
                this.logInputError="Username or Password field is empty"
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
                // console.log(this.currentUserID);
            } else if (response.status == 401) {
                console.log("Unsuccessful login attempt")
                this.logInputError= "Unsuccessful login attempt"
                this.passwordInput = "";
            } else {
                console.log("Some sort of error when POST /session. Error details: "+response.status+" "+response);
            }
        },

        postUser: async function () {
            if (this.newUsernameInput == "") {
                console.log("Please insert a username.");
                this.createAccError="Please insert a username.";
                return
            } else if (this.newPasswordInput == "") {
                console.log("Please insert a password");
                this.createAccError="Please insert a password";
                return
            } else if (this.newPasswordInput != this.newPasswordInput2) {
                console.log("Password inputs do not match. Re-type your password.");
                this.createAccError="Password inputs do not match. Re-type your password.";
                return
            } else if (this.newDefaultRole == "") {
                console.log("Please select a mowing or posting role.");
                this.createAccError="Please select a mowing or posting role.";
                return
            } else if (this.newFullNameInput == "") {
                console.log("Please insert your full name.");
                this.createAccError="Please insert your full name.";
                return
            } else if (this.newEmailInput == "") {
                console.log("Please insert a valid email address.");
                this.createAccError="Please insert a valid email address.";
                return
            } else if (this.newPhoneInput == "") {
                console.log("Please insert a valid phone number");
                this.createAccError="Please insert a valid phone number";
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
                    console.log("Username or email already taken. Please provide a new username or email.")
                    this.createAccError="Username or email already taken. Please provide a new username or email.";
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
                console.log("Successful lawns get: ", this.allLawns);
               
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
            this.newLawnMowInterval = this.newRepeatInterval_number+" "+this.newRepeatInterval_dayweek;
            if (this.newLawnDescription == "") {
                console.log("Please add a description.");
                this.postLawnError="Please add a description.";
                return
            } else if (this.newLawnAddress == "") {
                console.log("Please insert an address");
                this.postLawnError="Please insert an address";
                return
            } else if (this.newLawnPay == "") {
                console.log("Please insert a pay scale");
                this.postLawnError="Please insert a pay scale";
                return
            } else if (this.newLawnStartDate == "") {
                console.log("Please pick a start date");
                this.postLawnError="Please pick a start date";
                return
            } else if (this.newLawnMowInterval == "") {
                console.log("Please pick a mow interval");
                this.postLawnError="Please pick a mow interval";
                return
            // } else if (this.newLawnEndDate == "") {
            //     console.log("Please pick an end date.");
            //     this.postLawnError="Please pick an end date.";
            //     return
            // } else if (this.newLawnEndDate == "") {
            //     console.log("Please pick an end date.");
            //     return
            } else if (this.newLawnTime2Mow == "") {
                console.log("Please pick an appropriate time to mow");
                this.postLawnError="Please pick an appropriate time to mow";
                return
            }

            //Format start date to readable
            let splitStartDate = this.newLawnStartDate.split('-');
            let formattedStartDate = new Date(parseInt(splitStartDate[0]), (parseInt(splitStartDate[1]) - 1).toString(), (parseInt(splitStartDate[2])).toString());
            console.log(formattedStartDate);

            //Once user passes all checks, and no fields are null...
            await this.addLawnPhoto();
            let lawnSpecifics = {
                "address" : this.newLawnAddress,
                "time2Mow": this.newLawnTime2Mow,
                "image" : "",
                "pay" : this.newLawnPay,
                "description" : this.newLawnDescription,
                "startDate" : formattedStartDate,
                "mowInterval" : this.newLawnMowInterval,

                // "endDate" : this.newLawnEndDate,
                "hasLawnMower": this.newLawnHasLawnMower,
                "hasDogPoop": this.newLawnHasDogPoop,
                "hasFreeFood": this.newLawnHasFreeFood,
                "hasFreeWater": this.newLawnHasFreeWater,
            }
            console.log("lawnSpecifics are updated: ", lawnSpecifics)
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
            
            console.log(body);
            
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
                this.dontRepeatBox = false;
                this.newLawnHasLawnMower = false;
                this.newLawnHasDogPoop = false;
                this.newLawnHasFreeFood = false;
                this.newLawnHasFreeWater = false;
                this.getUser(this.currentUserID);
            } else if (response.status >= 400) {
                console.log ("Unsuccesful lawn creation attempt. Error: "+response.status+response);
            } else {
                console.log("Some sort of error when POST /lawn: "+response.status+response);
            }
        },
        
        addLawnPhoto: async function () {
            var files = document.getElementById("myfile").files;
            if (!files.length) {
              console.log("Please choose a file to upload first.");
              return;
            }
            console.log(files);
            var file = files[0];
            var photoKey = this.currentUserID + "-" + file.name;

            // let response = await fetch(this.awsURLs.awsAPIURL + photoKey, {
            //     //Never put body in get request
            //     // mode: 'no-cors',
            //     method: "PUT",
            //     headers: {"Content-Type": "multipart/form-data"},
            //     body: file
            // });

            console.log(photoKey)
            var upload = new AWS.S3.ManagedUpload({
                params: {
                  Bucket: this.photoBucketName,
                  Key: photoKey,
                  Body: file
                }
              });

            // console.log("Successfully uploaded photo.");
            // return;
            
            var promise = upload.promise();

            promise.then(
                async (data) => {
                    console.log("Successfully uploaded photo.");
                    this.newLawnImageURL = this.awsURLs.awsPhotoURL + photoKey;
                    await this.patchLawnURL();
                    this.$forceUpdate();
                    return;
                },
                (err) => {
                    console.log("There was an error uploading your photo: ", err.message);
                    this.newLawnImageURL = "";
                    return;
                }
            );
        },
        
        patchLawnURL: async function () {
            let newURL = URL + "/lawn/" + this.targetUser.lawns[this.targetUser.lawns.length - 1]._id;
            // console.log(newURL);
            let lawnPackage = {
                "newLawnImageURL": this.newLawnImageURL,
            }
            let response = await fetch(newURL, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(lawnPackage),
                credentials: "include"
            });
            if (response.status >= 200 && response.status < 300) {
                //Succesful update
                if (this.page == "profile-page") {
                    this.getUser(this.currentUserID)
                }
                console.log("Successful patch attempt");
            } else if (response.status >= 400) {
                console.log ("Unsuccesful PATCH /lawn")
            } else {
                console.log("Some sort of error when PATCH /lawn");
            }
        },

        patchLawn: async function () {
            let newURL = URL + "/updatelawn";
            let response = await fetch(newURL, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(targetLawn),
                credentials: "include"
            });
            if (response.status >= 200 && response.status < 300) {
                //Succesful update
                if (this.page == "profile-page") {
                    this.getUser(this.currentUserID)
                }
                this.$forceUpdate();
                console.log("Successful patch attempt");
            } else if (response.status >= 400) {
                console.log ("Unsuccesful PATCH /lawn")
            } else {
                console.log("Some sort of error when PATCH /lawn");
            }
        },

        // Switch a lawn from public to private or private to public
        patchLawnPublicity: async function (lawnID, newState) {
            let newURL = URL + "/lawn/" + lawnID + "/" + newState;
            // console.log(newURL);
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
                    this.getUser(this.currentUserID)
                }
                console.log("Successful patch attempt");
            } else if (response.status >= 400) {
                console.log ("Unsuccesful PATCH /lawn")
            } else {
                console.log("Some sort of error when PATCH /lawn");
            }
        },

        userLogout: async function () {
            let newURL = URL + "/logout";
            let response = await fetch(newURL, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.status == 200) {
                console.log("User has logged out");
                this.currentUserID = null;
                this.page = "landing-page";
                this.getSession();
            } else {
                console.log("User is still logged in");
                this.getSession();
            }
        },

        addSavedLawn: async function (lawn) {
            let newURL = URL + "/savedlawn";
            let parsedBody = {
                "command": "add",
                "lawnid": lawn._id
            }
            let response = await fetch(newURL, {
                method: "PATCH",
                body: JSON.stringify(parsedBody),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.status >= 200 && response.status < 300) {
                //Succesful update
                console.log("Successfully added saved lawn");
            } else if (response.status >= 400) {
                console.log ("Unsuccesful PATCH addSavedLawn")
            } else {
                console.log("Some sort of error when PATCH /savedlawn");
            }
        },

        removeSavedLawn: async function (lawn) {
            let newURL = URL + "/savedlawn";
            let parsedBody = {
                "command": "remove",
                "lawnid": lawn._id
            }
            let response = await fetch(newURL, {
                method: "PATCH",
                body: JSON.stringify(parsedBody),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.status >= 200 && response.status < 300) {
                //Succesful update
                console.log("Successfully removed saved lawn");
            } else if (response.status >= 400) {
                console.log ("Unsuccesful PATCH removeSavedLawn")
            } else {
                console.log("Some sort of error when PATCH /savedlawn");
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

        toggleBookmark: function (lawn) {
            if (this.targetUser.savedlawns.includes(lawn._id)) {
                let i = this.targetUser.savedlawns.indexOf(lawn._id);
                this.targetUser.savedlawns.splice(i, 1);
                this.removeSavedLawn(lawn);
            } else {
                this.targetUser.savedlawns.push(lawn._id);
                this.addSavedLawn(lawn);
            }
        },

        lawnFilterCheck: function (lawn) {
            //format dates to Date objects so they can be compared and day of the week can be found

            
            //Changes funny format to [day, year, month]
            let monthList = ['Jan ', 'Feb ', 'Mar ', 'Apr ', 'May ', 'Jun ', 'Jul ', 'Aug ', 'Sept', 'Oct ', 'Nov ', 'Dec ']
            let month = monthList.indexOf(lawn.startdate.slice(4, 8));
            let dateList = lawn.startdate.slice(8, 15).split(' ');
            dateList.push(month);

            //Checks the format of the date by trying to parse the first item as an integer
            filterLawnDate = ''
            if (parseInt(dateList[1]) == -1) {
                let otherDateList = lawn.startdate.slice(0,10).split('-');
                filterLawnDate = new Date(otherDateList[0], parseInt(otherDateList[1]) - 1, otherDateList[2]);
            } else {
                //Makes a new date object as new Date(year, month, day)
                filterLawnDate = new Date(parseInt(dateList[1]), (parseInt(dateList[2])), (parseInt(dateList[0])));
            }

            //Changes funny filter format to a new Date object
            let startDateFilterList = this.startDateFilter.substr(0, 10).split('-');
            let actualStartDateFilter = new Date(startDateFilterList[0], (parseInt(startDateFilterList[1]) - 1).toString(), (parseInt(startDateFilterList[2])).toString());

            //Finding day of the week
            let lawnDayInt = filterLawnDate.getDay();
            let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            let lawnDay = daysOfWeek[lawnDayInt];
            

            //Check filters
            if (!(lawn.pay >= this.minimumPayFilter && lawn.pay <= this.maximumPayFilter)) {
                console.log("Pay Filtered Out");
                return false
            }
            if (!(parseInt(lawn.time2mow) >= this.minimumJobDurationFilter && parseInt(lawn.time2mow) <= this.maximumJobDurationFilter)) {
                console.log("Job Duration Filtered Out");
                return false
            }
            if (!this.dayOfWeekFilter[lawnDay]) {
                console.log("Day of the week filtered out");
                console.log("Lawn day: " + lawnDay);
                console.log("Day filter: " + this.dayOfWeekFilter[lawnDay]);
                return false
            }
            if (filterLawnDate < actualStartDateFilter) {
                console.log("Date to start filtered out");
                return false
            }
            if (!(lawn.haslawnmower == this.lawnmowerProvidedFilter) && this.lawnmowerProvidedFilter != null) {
                console.log(lawn.address + " Has Lawn Mower Filtered Out");
                return false
            }

            return true
        },

        IDCheck: function (lawn) {
            if (lawn.user_id == this.currentUserID) {
                console.log("ID's match");
                return true
            } else {
                console.log("ID's do Not match");
                return false
            }
        },

        clearRepeat: function (){
        this.newRepeatInterval_number= "";
        this.newRepeatInterval_dayweek= "";
        },

        screenDelay: async function (time, nextPage) {
            this.page = "loading";
            console.log("Page is loading");

            await setTimeout(() => {              
                this.page = nextPage;
                console.log("Page set to: " + nextPage);
            }, time * 1000);
        },

        formatDate_MMMMDDYYYY: function (datestring) {
            year = datestring.slice(0, 4);
            monthNumber = datestring.slice(5, 7);
            switch (monthNumber) {
                case '01':
                    month = "January"
                    break;
                case '02':
                    month = "February"
                    break;
                case '03':
                    month = "March"
                    break;
                case '04':
                    month = "April"
                    break;
                case '05':
                    month = "May"
                    break;
                case '06':
                    month = "June"
                    break;
                case '07':
                    month = "July"
                    break;
                case '08':
                    month = "August"
                    break;
                case '09':
                    month = "September"
                    break;
                case '10':
                    month = "October"
                    break;
                case '11':
                    month = "November"
                    break;
                case '12':
                    month = "December"
                    break;
            };
            dateNumber = datestring.slice(8, 10);
            if (dateNumber[0] == "0") {
                date = dateNumber.slice(1, 2);
            } else {
                date = dateNumber;
            };
            newDate = new Date(datestring)
            dayNumber = newDate.getDay()
            weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
            day = weekday[dayNumber];
            console.log(`Year: ${year}, Month: ${month}, Date: ${date}, Day: ${day}`)
            formattedDate = day+", "+month+" "+date+", "+year
            return formattedDate
        }
    },

    created: function () {
        this.getSession();
        this.getLawns();
    }
            
});