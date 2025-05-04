const express = require('express')
const cors = require("cors");
require("dotenv").config();
const connectToMongo = require("./dbconfig/dbcon")



const app = express(); 
const port = process.env.PORT || 5000;

// // // routers
const testrouter = require("./routes/test.route")
const userrouter = require("./routes/userRoutes")
const recipesrouter = require("./routes/recipesrouter")

async function startserver(){
    try {

        await connectToMongo();
        app.use(cors());
        app.use(express.json());

        app.get('/', (req, res) => {
            res.send('hello world');
        });


        app.use("/api/test", testrouter);
        app.use("/api/users", userrouter);  // Use the user router  
        app.use("/api/recipes", recipesrouter);  // Use the recipes router


        app.listen(port , ()=>{
            console.log(`Server running at http://localhost:${port}`);
        })        

    } catch (error) {
        console.log(error)
    }

}

startserver();
