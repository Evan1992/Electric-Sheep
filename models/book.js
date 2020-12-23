const mongoose = require("mongoose")

var BookSchema = new mongoose.Schema({
    name:    String,
    author:  String,
    press:   String,
    ISBN:    String,
    cover:   {
        img_data: Buffer,
        contentType: String
    },
    star:    Number,
    Comment: String
})

module.exports = mongoose.model("Book", BookSchema);