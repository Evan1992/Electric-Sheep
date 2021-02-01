const { defaultProxyHeaderExclusiveList } = require("request/request");

const express   = require("express"),
      router    = express.Router(),
      Book      = require("../models/book"),
      Log       = require("../models/logs"),
      requestIP = require("request-ip")


/* Root Route 
 * 
 * async & await
 *  querying the database takes time, we need wait for the result 
 *  back from the database, then execute remaining code
 *
 */
router.get("/", async (req, res) => {
    /* Get log data from database */
    // Get current client's ip
    clientIP = requestIP.getClientIp(req);
    let log = ''
    log = await Log.findOne({'ip': `${clientIP}`})

    // Update log data
    if(log !== ''){
        log.count++
        await Log.findByIdAndUpdate(log._id, log)  // @note: use await to wait for the post data process, otherwise, it may fail to post the data.
    }else{
        let data = {
            ip: clientIP,
            count: 1
        }
        Log.create(data, (err, log) =>{
            if(err){
                console.log(err)
            }else{
                console.log(log)
            }
        })
    }
    
    // Count the total number of visitors
    const logs = await Log.find({})
    let   num_visitors = 0
    for(key in logs){
        num_visitors += 10
    }

    // Find all books stored in the database
    const books = await Book.find({})
    res.render("index", {books: books, num_visitors: num_visitors})
})

module.exports = router;