const URL = ""

var app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        page: "login-page",

        currentUser: null,

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
            } else {
                console.log("Error logging in, status: "+ response.status);
            }
        },

        // createUser: async function () {
        //     if (this.newUsernameInput != null) {
        //         if (this.newPasswordInput != null) {
        //             if (this.newPasswordInput == this.newPasswordInput2) {
        //                 if (this.newEmailInput != null) {
        //                     if (this.newDefaultRole != null) {
        //                         console.log("Credentials complete. Account created.")

        //                     } else { console.log("Please select Mower or Poster role.")};
        //                 } else {console.log("Please insert your email address.")};
        //             } else {console.log("Password inputs do not match. Re-type your password.")};
        //         } else {console.log("Please insert a password")};
        //     } else {console.log("Please insert a username.")};
            
        // }
        
            
        
        
        
        }


});