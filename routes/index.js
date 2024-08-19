const json = require("body-parser/lib/types/json");
const { defaultProxyHeaderExclusiveList } = require("request/request");

const express   = require("express"),
      router    = express.Router(),
      Book      = require("../models/book"),
      Drama     = require("../models/drama"),
      Record    = require("../models/record"),
      Game      = require("../models/game"),
      Log       = require("../models/logs"),
      requestIP = require("request-ip"),
      request   = require("request")

/* Root Route 
 * async & await
 *  querying the database takes time, we need wait for the result 
 *  back from the database, then execute remaining code
 */
// router.get("/", async (req, res) => {
//     request.get(`https://api.ipify.org?format=json`, async(err, res, body) =>{
//         console.log(body);
//         const clientIP = JSON.parse(body);
//         console.log(clientIP)
//         console.log(clientIP.ip)
//     })
//     // Find all books stored in the database
//     const books = await Book.find({})
//     res.render("index", {books: books})
// })

router.get("/", async (req, res) => {
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
                Log.create(data, (err, log) =>{
                    if(err){
                        console.log(err)
                    }else{
                        console.log(log)
                    }
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
    res.render("index", {
        books: books,
        dramas: dramas,
        records: records,
        games: games,
        num_visitors: num_visitors
    })
})

module.exports = router;