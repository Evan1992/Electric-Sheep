/*  
 * This is a server file to handle the logic of interaction with the server
 * 
 */
const express    = require("express"),
      app        = express(),
      request    = require("request"),
      bodyParser = require("body-parser"),
      path       = require("path"),
      mongoose   = require("mongoose"),
      dotenv     = require("dotenv").config()

/*
 * Set EJS as the templating engine with Express.
 * The default behavior of EJS is that it looks into
 * the 'views' folder for the templates to render
 * 
 */
app.set("view engine", "ejs");

/*
 * Set default view path in Express.js
 * 
 * __dirname: an environment variable that tells you
 * the absolute path of the directory containing the
 * currently executing file
 * 
 */
const viewPath = path.join(__dirname, 'views')
app.set('views', viewPath);

/*
 * Set path in order to use external files
 */
app.use(express.static(__dirname+"/views"))
app.use(express.static(__dirname+"/public/pictures"))
app.use(express.static(__dirname+"/public/pictures/books"))
app.use(express.static(__dirname+"/public/pictures/dramas"))
app.use(express.static(__dirname+"/public/pictures/music"))
app.use(express.static(__dirname+"/public/pictures/weather_icons"))

/*
 * Parse the data
 */
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/*
 * Require routes
 */
const indexRoutes = require("./routes/index");
const itemRoutes  = require("./routes/item")
app.use(indexRoutes);
app.use(itemRoutes);

/*
 * Connect to database MongoDB Atlas
 */
const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, err=>{
    console.log("Connected to the database");
});

/*
 * Connect to Server
 */
const port = process.env.PORT || 3000; 
app.listen(port, () =>{
    console.log("Listening on port", port)
})
