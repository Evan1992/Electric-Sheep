/**
 * @brief This is a server file to handle the logic of interaction with the server
 * 
 * Packages
 * - method-override
 *      form only has two methods: GET and POST,
 *      to put, patch, and delete, we can use the 
 *      method-override 
 */

require('dotenv').config();
const express        = require("express"),
      app            = express(),
      request        = require("request"),
      bodyParser     = require("body-parser"),
      path           = require("path"),
      mongoose       = require("mongoose"),
      dotenv         = require("dotenv").config(),
      methodOverride = require("method-override"),
      cookieParser   = require('cookie-parser')

/**
 * Set EJS as the templating engine with Express.
 * The default behavior of EJS is that it looks into
 * the 'views' folder for the templates to render
 * 
 */
app.set("view engine", "ejs");

/**
 * @brief Set default view path in Express.js
 * 
 * __dirname: an environment variable that tells you
 * the absolute path of the directory containing the
 * currently executing file
 * We can do console.log(__dirname) to print out __dirname, and for this project, the output is /Users/yilong/Documents/Computer Science/Projects/ElectricSheep/Electric-Sheep
 * 
 */
const viewPath = path.join(__dirname, 'views')
app.set('views', viewPath);

/*
 * Set path in order to use external files
 * 
 * Difference between:
 *  app.use(express.static(__dirname+"/public"))
 *  app.use(express.static(path.join(__diranme, "public")))
 * They achieve the same result, which is to concatenate two strings to form the full path
 * 
 * app.use(express.static(path.join(__dirname, "scripts")))
 *  Specify how the static files are served
 *  URL to access dropDownSelect.js: http://yourdomain.com/scripts/dropDownSelect.js
 */
app.use(express.static(__dirname + "/views"))
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, "public")))
app.use(express.static(__dirname + "/public/pictures/weather_icons"))
app.use(express.static(path.join(__dirname, "scripts")))

/**
 * @brief Parse the data
 */
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(methodOverride('_method'));

// Middleware to parse cookies
app.use(cookieParser());

/**
 * Require routes
 */
const indexRoutes = require("./routes/index");
const itemRoutes  = require("./routes/item");
const bucketListRoutes = require("./routes/bucket-list");
app.use(indexRoutes);
app.use(itemRoutes);
app.use(bucketListRoutes);

const dbUrl = `mongodb+srv://longyi:824219@freecluster.tby7p.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority&appName=FreeCluster`

mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS: 10000
})
.then(() => {
    console.log('MongoDB connected successfully');
})
.catch((error) => {
    console.error('Connection error', error);
});

/**
 * @brief Connect to Server
 */
const port = process.env.PORT || 3000; 
app.listen(port, () =>{
    console.log(`Listening on port ${port}`)
})
