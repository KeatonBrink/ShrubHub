const URL = ""

var app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        page: "landing-page",

        currentUser: null,

        usernameInput: "",
        passwordInput: "",

        newUsername: "",
        newPassword:"",
        newEmail:"",
        newPhoneNumber: "",
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
            } else {
                console.log("Error logging in, status: "+ response.status);
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
                console.log("Successful login attempt");
                this.usernameInput = "";
                this.passwordInput = "";
            } else if (response.status == 401) {
                console.log ("Unsuccesful login attempt")
                this.loginPassWord = "";
            } else {
                console.log("Some sort of error when POST /session");
            }
        },
    }
});