const mongoose = require("mongoose")

var ChannelSchema = new mongoose.Schema({
    name:        String,
    influencer:  String,
    intro:       String,
    categories:  Array,
    platforms:   Array,
    cover:   {
        img_data: Buffer,
        contentType: String
    },
    stars:        Number,
    commentaries: Array,
    haveWatched:  Boolean,
})

module.exports = mongoose.model("Channel", ChannelSchema);