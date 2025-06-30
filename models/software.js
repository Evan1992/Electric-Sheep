const mongoose = require("mongoose")

var SoftwareSchema = new mongoose.Schema({
    name:        String,
    company:     String,
    founders:    String,
    year:        String,
    intro:       String,
    platforms:   Array,
    cover:   {
        img_data: Buffer,
        contentType: String
    },
    stars:       Number,
    itemType:    String
})

module.exports = mongoose.model("Software", SoftwareSchema);