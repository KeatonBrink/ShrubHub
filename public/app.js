const URL = ""

var app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        page: "landing-page",

        currentUser: null,
        currentLawn: null,
        targetUser: null,
        allLawns: null,

        usernameInput: "",
        passwordInput: "",

        newUsernameInput: "",
        newPasswordInput:"",
        newPasswordInput2:"",
        newEmailInput:"",
        newPhoneInput: "",
        newProfilePic: "",
        newDefaultRole: "",

        mowerView: false,
        posterView: false,
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
                this.page = "mowermain";
            } else if (response.status == 401) {
                console.log("Incorrect username or password. Try again.");
                this.page = "landing-page";
            } else {
                this.page = "landing-page";
                console.log("Error logging in, status: "+ response.status);
            }
        },

        createUser: async function () {
            if (this.newUsernameInput != null) {
                if (this.newPasswordInput != null) {
                    if (this.newPasswordInput == this.newPasswordInput2) {
                        if (this.newEmailInput != null) {
                            if (this.newDefaultRole != null) {
                                console.log("Credentials complete. Account created.")

                            } else { console.log("Please select Mower or Poster role.")};
                        } else {console.log("Please insert your email address.")};
                    } else {console.log("Password inputs do not match. Re-type your password.")};
                } else {console.log("Please insert a password")};
            } else {console.log("Please insert a username.")};
            
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
                console.log ("Unsuccesful get user")
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
                console.log ("Unsuccesful login attempt")
                this.passwordInput = "";
            } else {
                console.log("Some sort of error when POST /session");
            }
        },

        //GET threads
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
                this.curPage = 3;
            } else if (response.status >= 400) {
                console.log ("Unsuccesful get lawns")
            } else {
                console.log("Some sort of error when GET /lawns");
            }
        },
    },

    created: function () {
        this.getSession();
    }
});