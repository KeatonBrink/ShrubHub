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
            toggleDayFilter: function (day) {
                if (this.dayOfWeekFilter[day]) {
                    this.dayOfWeekFilter[day] = false;
                } else {
                    this.dayOfWeekFilter[day] = true;
                }
                console.log(day + ': ' + this.dayOfWeekFilter[day]);
                return this.dayOfWeekFilter
            }
        }
});