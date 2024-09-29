const express = require("express");
const session = require("express-session");
const app = express();
const port = 3000;
const sqlite3 = require("sqlite3").verbose();

//Starts a session
const session1 = "My_1st_session";

//items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database("./database.db", function (err) {
  if (err) {
    console.error(err);
    process.exit(1); //Bail out we can't connect to the DB
  } else {
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON"); //This tells SQLite to pay attention to foreign key constraints
  }
});

const userRoutes = require("./routes/user");

//set the app to use ejs for rendering
app.set("view engine", "ejs");
//To parse incoming requiest bodies
app.use(express.urlencoded({ extended: true }));
//To config express-session middleware
app.use(
  session({
    secret: session1,
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//this adds all the userRoutes to the app under the path /user
app.use("/user", userRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

