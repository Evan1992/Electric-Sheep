const { isAdmin } = require("./auth-middleware");

const express      = require("express"),
      router       = express.Router(),
      Subscription = require("../models/subscription")

// Read and validate the submitted fields; returns null if invalid
function parseSubscription(body) {
    const name = (body.name || "").trim();
    const url  = (body.url || "").trim();

    // Only accept http(s) links so the href can't run script
    if (!name || !/^https?:\/\//i.test(url)) {
        return null;
    }
    return { name, url };
}

// Create a new subscription (admin only)
router.post("/subscription", isAdmin, async (req, res) => {
    const data = parseSubscription(req.body);
    if (data) {
        try {
            await Subscription.create(data);
        } catch (error) {
            console.error('Fail to create the subscription', error);
        }
    }
    res.redirect("/admin");
})

// Update a subscription (admin only)
router.put("/subscription/:id", isAdmin, async (req, res) => {
    const data = parseSubscription(req.body);
    if (data) {
        try {
            await Subscription.findByIdAndUpdate(req.params.id, data);
        } catch (error) {
            console.error('Fail to update the subscription', error);
        }
    }
    res.redirect("/admin");
})

// Delete a subscription (admin only)
router.delete("/subscription/:id", isAdmin, async (req, res) => {
    try {
        await Subscription.findByIdAndDelete(req.params.id);
    } catch (error) {
        console.error('Fail to delete the subscription', error);
    }
    res.redirect("/admin");
})

module.exports = router
