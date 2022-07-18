const URL = ""

var app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        page: "login-page",

        currentUser: null,
        currentLawn: null,
        targetUser: null,
        targetLawn: null,
        allLawns: null,

        usernameInput: "",
        passwordInput: "",

        newUsernameInput: "",
        newPasswordInput: "",
        newPasswordInput2: "",
        newEmailInput: "",
        newPhoneInput: "",
        newProfilePic: "",
        newDefaultRole: "",

        mowerView: false,
        posterView: false,

        date1: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        dayWeek: ["days", "weeks"],
        repeatIntervalInput: [1,2,3,4,5,6,7,8,9,10,11,12,13],
        
        startDateFilterReveal: false,
        lawnmowerProvidedFilter: false,
    },

    methods: {
        getSession: async function () {
            let response = await fetch(`${URL}/session`, {
                method: "GET",
                credentials: "include"
            });
            if (response.status == 200) {
                this.currentUser = await response.json()
                console.log("Log In Successful");
                this.page = "profile-page";
            } else if (response.status == 401) {
                console.log("Incorrect username or password. Try again.");
                this.page = "landing-page";
            } else {
                this.page = "landing-page";
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
            } else if (response.status >= 400) {
                console.log("Unsuccesful get user")
            } else {
                console.log("Some sort of error when GET /user/:id");
            }


        },

        postSession: async function () {
            if (this.usernameInput == "" || this.passwordInput == "") {
                console.log("Username or Password field is empty");
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

            //Parse response data
            let body = await response.json();

            //Check for successful login
            if (response.status == 201) {
                //Succesful login
                // console.log("Successful login attempt ", body);
                this.usernameInput = "";
                this.passwordInput = "";
                //This is a terrible idea, I think
                this.getSession();
            } else if (response.status == 401) {
                console.log("Unsuccesful login attempt")
                this.passwordInput = "";
            } else {
                console.log("Some sort of error when POST /session");
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
                    "role" : this.newDefaultRoleInput,
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

// START HERE - I haven't added response status checks.

                this.page = "login-page"
                console.log("Account credentials valid. Account Created.");
                return
            }
        },

        postLawn: async function () {
            
        },

    },

    created: function () {
        this.getSession();
    }
});