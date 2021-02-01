const mongoose = require('mongoose')

var LogSchema = new mongoose.Schema({
    ip:    String,
    count: Number
})

module.exports = mongoose.model("Log", LogSchema)