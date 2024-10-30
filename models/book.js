const mongoose = require("mongoose")

var BookSchema = new mongoose.Schema({
    name:    String,
    author:  String,
    press:   String,
    year:    String,
    ISBN:    String,
    cover:   {
        img_data: Buffer,
        contentType: String
    },
    recurrence: Number,
    stars:   Number,
    commentaries: Array,
    haveRead: Boolean,
    excerpts: Array

    /** 
     * Add more properties of the book model
     * ...
     */
})

module.exports = mongoose.model("Book", BookSchema);