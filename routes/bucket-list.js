const express = require("express"),
      router  = express.Router()

router.get("/bucket-list/show", (req, res)=>{
    res.render("bucket-list/show")
})

module.exports = router