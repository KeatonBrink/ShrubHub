const app = require("./server/server.js");
const {connect, onConnect} = require("./persist/connect");
//This file is missing from github for security reasons
const config = require("./config")

onConnect(() => {
    app.listen(8080, () => {
        console.log("serving on port 8080");
    });    
})

try{
    //The mongo user and pass should be safe in the config file, which is not uploaded to github
    connect(config.mongo_user, config.mongo_pass);
    // connect();
} catch (err) {
    console.log(err);
    throw "couldn't connect";
}