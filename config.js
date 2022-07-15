//config file - for assigning the port number and the mongoDB username and password


const dotenv = require("dotenv").config();
// calls instance of dotenv file

port = process.env.PORT || 3000;
// calls for secure port number in .env file, but pulls port # 3000 if failure

// variables for export in other files
module.exports = {
    port : port, 
    user: process.env.USER,
    password : process.env.PASS,
    session_key : process.env.SESSION_KEY,
}

