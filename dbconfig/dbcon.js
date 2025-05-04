const mongoose = require("mongoose");
require("dotenv").config();

const conurl = process.env.MONGO_URI;
const dbname = "recipesproject";


if (!conurl) {
    console.error("Error: MONGO_URI is not defined in the .env file.");
    process.exit(1);
}


async function connectToMongo() {

    try {
        const resp = await mongoose.connect(conurl)
        console.log('Connection successful!')
        dbinst = resp.connection.useDb(dbname);
        return dbinst

    } catch (error) {   
        console.log("connection failed >> "+error)
    }
}

module.exports = connectToMongo;