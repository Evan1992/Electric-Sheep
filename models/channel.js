const mongoose = require("mongoose")

var ChannelSchema = new mongoose.Schema({
    name:        String,
    influencer:  String,
    platform:    String,
    cover:   {
        img_data: Buffer,
        contentType: String
    },
    stars:       Number,
    comments:    Array,
    haveWatched: Boolean,
})

module.exports = mongoose.model("Channel", ChannelSchema);