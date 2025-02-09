const mongoose = require("mongoose")

var GameSchema = new mongoose.Schema({
    name:        String,
    developer:   String,
    genre:       String,
    year:        String,
    cover:   {
        img_data: Buffer,
        contentType: String
    },
    stars:       Number,
    comments:    Array,
    havePlayed:  Boolean,
    itemType:    String
})

module.exports = mongoose.model("Game", GameSchema);