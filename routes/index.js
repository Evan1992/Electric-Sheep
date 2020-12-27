const { defaultProxyHeaderExclusiveList } = require("request/request");

const express = require("express"),
      router  = express.Router(),
      Book    = require("../models/book")


/* Root Route 
 * 
 * async & await
 *  querying the database takes time, we need wait for the result 
 *  back from the database, then execute remaining code
 *
 */
router.get("/", async (req, res) => {
    // Find all books stored in the database
    const books = await Book.find({})
    res.render("index", {books: books})
})

module.exports = router;