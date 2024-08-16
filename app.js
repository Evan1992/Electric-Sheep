/**
 * @brief This is a server file to handle the logic of interaction with the server
 * 
 * Packages
 * - method-override
 *      form only has two methods: GET and POST,
 *      to put, patch, and delete, we can use the 
 *      method-override 
 */

const express        = require("express"),
      app            = express(),
      request        = require("request"),
      bodyParser     = require("body-parser"),
      path           = require("path"),
      mongoose       = require("mongoose"),
      dotenv         = require("dotenv").config(),
      methodOverride = require("method-override")

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
 * 
 */
const viewPath = path.join(__dirname, 'views')
app.set('views', viewPath);

/*
 * Set path in order to use external files
 * 
 * Difference between 
 *  app.use(express.static(__dirname+"/public"))
 *  app.use(express.static(path.join(__diranme, "public")))
 */
app.use(express.static(__dirname + "/views"))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.static(__dirname + "/public/pictures/weather_icons"))

/**
 * @brief Parse the data
 */
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/* */
app.use(methodOverride('_method'));

/**
 * Require routes
 */
const indexRoutes = require("./routes/index");
const itemRoutes  = require("./routes/item");
const bucketListRoutes = require("./routes/bucket-list");
app.use(indexRoutes);
app.use(itemRoutes);
app.use(bucketListRoutes);

/**
 * @brief Connect to database MongoDB Atlas
 */
// const dbUrl = process.env.DB_URL
// mongoose.connect(dbUrl, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false
// }, err=>{
//     console.log("Connected to the database");
// });
const dbUrl = "mongodb+srv://longyi:824219@freecluster.tby7p.mongodb.net/?retryWrites=true&w=majority&appName=FreeCluster"
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, err=>{
    console.log("Connected to the database");
});

/**
 * @brief Connect to Server
 */
const port = process.env.PORT || 3000; 
app.listen(port, () =>{
    console.log(`Listening on port ${port}`)
})
