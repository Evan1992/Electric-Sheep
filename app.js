const express = require("express"),
      app     = express()

// ========================
// Require routes
// ========================
const indexRoutes = require("./routes/index");
app.use(indexRoutes);

const port = 3000;
app.listen(port, () =>{
    console.log("Listening on port ", port)
})
