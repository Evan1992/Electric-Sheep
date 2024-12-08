const jwt = require('jsonwebtoken');
const json = require("body-parser/lib/types/json");
const bcrypt = require('bcrypt'); // For securely comparing passwords
const { defaultProxyHeaderExclusiveList } = require("request/request");

const express   = require("express"),
      router    = express.Router(),
      Admin     = require("../models/admin"),
      Book      = require("../models/book"),
      Drama     = require("../models/drama"),
      Record    = require("../models/record"),
      Game      = require("../models/game"),
      Channel   = require("../models/channel"),
      Podcast   = require("../models/podcast"),
      Log       = require("../models/logs"),
      requestIP = require("request-ip"),
      request   = require("request")

async function registerUser(username, password, role) {
    try {
        const newUser = new Admin({ username, password, role });
        await newUser.save();
        console.log('User registered successfully!');
    } catch (err) {
        console.error('Error registering user:', err);
    }
}
// Comment out the following line to use this function when register a new admin
// registerUser('dummyUserName', 'dummyPassword', "dummyRole");

// Admin login route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user in the database
        const user = await Admin.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token after matching the password
        const token = jwt.sign(
            { userId: user._id, role: user.role }, // Payload
            process.env.ADMIN_SECURITY_KEY,        // Environment variable
            { expiresIn: '24h' }                   // Token expiry
        );

        // Send token as HttpOnly cookie
        res.cookie('auth_token', token, { httpOnly: true, secure: false }); // Set secure: true in production

        return res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

router.post("/logout", async (req, res) => {
    // Clear the 'auth_token' cookie
    res.clearCookie('auth_token', { httpOnly: true, secure: false });
    res.status(200).json({ message: 'Logged out successfully' });
})

// Middleware to verify JWT
const isAdminRedirect = (req, res, next) => {
    if (typeof req.cookies !== 'undefined') {
        try {
            const token = req.cookies.auth_token;
            if (token) {
                jwt.verify(token, process.env.ADMIN_SECURITY_KEY);
                return res.redirect('/admin');
            }
        } catch (err) {
            // Do nothing
        }
    }
    next();
};
const isAdmin = (req, res, next) => {
    if (typeof req.cookies !== 'undefined') {
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(403).json({ error: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.ADMIN_SECURITY_KEY);
            req.user = decoded; // Attach user data to the request object
        } catch (err) {
            res.status(401).json({ error: 'Invalid or expired token' });
        }
    }
    next();
};

/* Root Route 
 * async & await
 *  querying the database takes time, we need wait for the result 
 *  back from the database, then execute remaining code
 */
router.get("/", isAdminRedirect, async (req, res) => {
    // Get current client's ip
    await request.get(`https://api.ipify.org?format=json`, async (err, res, body) =>{
        const clientIP = JSON.parse(body).ip
        // Get log data from database
        try{
            let log = await Log.findOne({'ip': `${clientIP}`})
            // Update log data
            if(log !== null){
                log.count++
                await Log.findByIdAndUpdate(log._id, log)  // @note: use await to wait for the post data process, otherwise, it may fail to post the data.
            }else{
                let data = {
                    ip: clientIP,
                    count: 1
                }
                
                Log.create(data)
                .then(() => {
                    console.log('Create log successfully');
                })
                .catch((error) => {
                    console.error('Fail to create the log', error);
                })
            }
        }catch(error){
            console.log(error)
        }
    })

    // Count the total number of visitors
    const logs = await Log.find({})
    let   num_visitors = 0
    for(key in logs){
        num_visitors += 1
    }

    // Find all itmes stored in the database
    const books = await Book.find({})
    const dramas = await Drama.find({})
    const records = await Record.find({})
    const games = await Game.find({})
    const channels = await Channel.find({})
    const podcasts = await Podcast.find({})
    res.render("index", {
        books: books,
        dramas: dramas,
        records: records,
        games: games,
        channels: channels,
        podcasts: podcasts,
        num_visitors: num_visitors
    })
})

router.get("/admin", isAdmin, async (req, res) => {
    // Get current client's ip
    await request.get(`https://api.ipify.org?format=json`, async (err, res, body) =>{
        const clientIP = JSON.parse(body).ip
        // Get log data from database
        try{
            let log = await Log.findOne({'ip': `${clientIP}`})
            // Update log data
            if(log !== null){
                log.count++
                await Log.findByIdAndUpdate(log._id, log)  // @note: use await to wait for the post data process, otherwise, it may fail to post the data.
            }else{
                let data = {
                    ip: clientIP,
                    count: 1
                }

                Log.create(data)
                .then(() => {
                    console.log('Create log successfully');
                })
                .catch((error) => {
                    console.error('Fail to create the log', error);
                })
            }
        }catch(error){
            console.log(error)
        }
    })

    // Count the total number of visitors
    const logs = await Log.find({})
    let   num_visitors = 0
    for(key in logs){
        num_visitors += 1
    }

    // Find all itmes stored in the database
    const books = await Book.find({})
    const dramas = await Drama.find({})
    const records = await Record.find({})
    const games = await Game.find({})
    const channels = await Channel.find({})
    const podcasts = await Podcast.find({})
    res.render("index-admin", {
        books: books,
        dramas: dramas,
        records: records,
        games: games,
        channels: channels,
        podcasts: podcasts,
        num_visitors: num_visitors
    })
})


module.exports = router;