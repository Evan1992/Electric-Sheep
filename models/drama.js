const mongoose = require("mongoose")

var DramaSchema = new mongoose.Schema({
    name:         String,
    director:     String,
    year:         String,
    cover:   {
        img_data: Buffer,
        contentType: String
    },
    recurrence:   Number,
    stars:        Number,
    lines:        Array,
    commentaries: Array,
    haveWatched:  Boolean,
})

module.exports = mongoose.model("Drama", DramaSchema);