const mongoose = require("mongoose")

var RecordSchema = new mongoose.Schema({
    name:        String,
    artist:      String,
    genre:       String,
    medium:      String,
    year:        String,
    cover:   {
        img_data: Buffer,
        contentType: String
    },
    stars:       Number,
    comments:    Array,
    owned:       Boolean,
})

module.exports = mongoose.model("Record", RecordSchema);