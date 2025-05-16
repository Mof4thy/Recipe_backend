const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();
const connectToMongo = require("./dbconfig/dbcon");

const app = express();
const port = process.env.PORT || 4000;

// // // routers
const testrouter = require("./routes/test.route");
const userrouter = require("./routes/userRoutes");
const recipesrouter = require("./routes/recipesrouter");

async function startserver() {
  try {
    await connectToMongo();
    app.use(
      cors({
        origin: "http://localhost:4200  ",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      })
    );
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("hello world");
    });

    app.use("/api/test", testrouter);
    app.use("/api/users", userrouter); // Use the user router
    app.use("/api/recipes", recipesrouter); // Use the recipes router

    // Serve static files from the uploads folder
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

startserver();
