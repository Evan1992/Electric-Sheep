const mongoose = require("mongoose")

var ChannelSchema = new mongoose.Schema({
    name:        String,
    influencer:  String,
    cover:   {
        img_data: Buffer,
        contentType: String
    },
    stars:       Number,
    comments:    Array,
    haveWatched: Boolean,
})

module.exports = mongoose.model("Channel", ChannelSchema);