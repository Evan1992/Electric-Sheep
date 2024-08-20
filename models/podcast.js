const mongoose = require("mongoose")

var PodcastSchema = new mongoose.Schema({
    name:         String,
    host:         String, 
    cover:   {
        img_data: Buffer,
        contentType: String
    },
    stars:        Number,
    comments:     Array,
    haveListened: Boolean,
})

module.exports = mongoose.model("Podcast", PodcastSchema);