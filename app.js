const express = require("express"),
      app     = express()

/*
Set path in order to use external files
*/
app.use(express.static(__dirname+"/views"));
app.use(express.static(__dirname+"/public/pictures/books"))
app.use(express.static(__dirname+"/public/pictures/dramas"))

/*
Require routes
*/
const indexRoutes = require("./routes/index");
app.use(indexRoutes);

/*
Connect to Server
*/
const port = process.env.PORT || 3000; 
app.listen(port, () =>{
    console.log("Listening on port", port)
})
