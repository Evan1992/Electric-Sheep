const mongoose = require("mongoose")

var SubscriptionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url:  { type: String, required: true }
})

module.exports = mongoose.model("Subscription", SubscriptionSchema);
