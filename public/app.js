const URL = ""

var app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data: {
        page: "mowermain",

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

            }
        }

});