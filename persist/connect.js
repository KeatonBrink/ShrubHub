//Connects to mongoose
const mongoose = require('mongoose')
const db = mongoose.connection;

async function connect(URL){
    //mongoose.set("useCreateIndex", true);
    try {
        await mongoose.connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    } catch (err) {
        console.log("Error connecting to mongoose: ", err);
        throw "Mongo could not connect";
    }
}

async function onConnect (callback) {
    db.once("open", ()=>{
        console.log("Server connection open");
        callback();
    })
}

module.exports = {
    connect,  
    onConnect,
}