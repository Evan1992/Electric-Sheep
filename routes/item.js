/** 
 * @Packages
 *  multer
 *      Multer is a node.js middleware for handling multipart/form-data,
 *      which is primarily used for uploading files. It is written on top
 *      of busboy for maximum efficiency.
 *      NOTE: Multer will not process any form which is not multipart(multipart/form-data)
 *      In case you need to handle a text-only multipart form, you should use the .none() method,
 *      like upload.none() 
 */
const express        = require("express"),
      router         = express.Router(),
      Book           = require("../models/book"),
      Drama          = require("../models/drama"),
      Record         = require("../models/record"),
      Game           = require("../models/game"),
      Channel        = require("../models/channel"),
      Software       = require("../models/software"),
      Podcast        = require("../models/podcast"),
      fs             = require("fs"),
      multer         = require("multer"),
      upload         = multer({dest: 'uploads/'}),
      { isAdmin }    = require("./auth-middleware")

/**
 * @brief Upload the image to mongodb
 *
 * @Packages
 *  Multer
 *      Introduction
 *          Multer is a node.js middleware for handling multipart/form-data, which is
 *          primarily used for uploading files.
 *      Usage
 *          Multer adds a body object and a file or files object to the request object.
 *          The boday object contains the values of the text fields of the form, the 
 *          file or files object contains the files uploaded via the form.
 * 
 *  fs-extra
 *      Introduction
 *          fs-extra adds file system methods that aren't included in the natvie fs
 *          module and adds promise support to the fs methods. It also uses graceful-fs
 *          to prevent EMFILE errors. It should be a drop in the replacement for fs 
 */
router.post('/book/new', upload.single('cover'), isAdmin, (req, res)=>{
    // req.file is the 'cover' file
    // req.body will hold the text fields, if there were any
    console.log(req.body);
    console.log(req.file);

    data = {
        name:    req.body.name,
        author:  req.body.author,
        press:   req.body.press,
        year:    req.body.year,
        ISBN:    req.body.ISBN,
        recurrence: 0,
        stars:   0,
        Comment: "",
        haveRead: false,
        excerpts: [],
        itemType: "book"
    }

    if(req.file !== undefined) {
        data.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    Book.create(data)
    .then((book) => {
        console.log(book)
        res.redirect(`/book/${book._id}/show?isAdmin=true`);
    })
    .catch((error) => {
        console.error('Failed to create a new book', error)
    })
})
router.get("/book/new", isAdmin, (req, res)=>{
    res.render("book/new")
})

router.get("/book/index", async (req, res)=>{
    allBooks = await Book.find({})
    res.render("book/index", {allBooks})
})

router.get("/book/:id/show", async (req, res) =>{
    const isAdmin = req.query.isAdmin === 'true';
    book = await Book.findById(req.params.id)
    commentaries = book.commentaries
    res.render("book/show", {isAdmin, book, commentaries})
})

router.get("/book/:id/edit", isAdmin, async (req, res) =>{
    book = await Book.findById(req.params.id)
    res.render("book/edit", {book})
})

router.get("/book/:id/commentary/new", async (req, res) =>{
    book = await Book.findById(req.params.id)
    res.render("shared/commentary/new", {item: book})
})

router.get("/book/:id/commentary/:commentaryId", async (req, res) =>{
    book = await Book.findById(req.params.id)
    for (const commentary of commentaries) {
        if (commentary.id == req.params.commentaryId) {
            res.render("shared/commentary/show", {commentary})
        }
    }
})

/**
 * @Note
 *  Don't forget to add upload, otherwise, req.body is empty.    
 */
router.put("/book/:id", upload.single('cover'), isAdmin, async (req, res)=>{
    const { id } = req.params
    const newData = req.body

    // Update haveRead
    if(newData.haveRead){
        newData.haveRead = true
        newData.recurrence = 1
    }
    // Update excerpts
    if(newData.add_excerpt){
        const book = await Book.findById(req.params.id)
        newData.excerpts = [...book.excerpts] // Clone an array in ES6
        newData.excerpts.push(newData.add_excerpt)
    }
    if(newData.delete_excerpt){
        const book = await Book.findById(req.params.id)
        newData.excerpts = [...book.excerpts]
        newData.excerpts.splice(newData.delete_excerpt, 1)
    }
    // Update recurrence
    if(newData.recurrence) {
        newData.recurrence = parseInt(newData.recurrence)
    }
    // Update image
    if(req.file !== undefined) {
        newData.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    const book = await Book.findByIdAndUpdate(id, req.body)
    res.redirect(`/book/${book._id}/show?isAdmin=true`)
})

router.put("/book/:id/commentary/new", isAdmin, async (req, res) =>{
    const newData = req.body

    if(newData.title && newData.content) {
        const book = await Book.findById(req.params.id)
        newData.commentaries = [...book.commentaries]
        newData.commentaries.push(
            {
                id: Math.random().toString(16).slice(2),
                title: newData.title,
                content: newData.content
            }
        )
    }

    await Book.findByIdAndUpdate(req.params.id, req.body)
    res.redirect(`/book/${book._id}/show?isAdmin=true`)
})

router.delete("/book/:id", isAdmin, async (req, res) =>{
    const { id } = req.params
    await Book.findByIdAndDelete(id)
    res.redirect("/")
})

/* =================== Dramas =================== */
router.get("/drama/new", isAdmin, (req, res)=>{
    res.render("drama/new")
})

router.get("/drama/index", async (req, res)=>{
    dramas = await Drama.find({})
    res.render("drama/index", {dramas})
})

router.get("/drama/:id/show", async (req, res) =>{
    const isAdmin = req.query.isAdmin === 'true';
    drama = await Drama.findById(req.params.id)
    commentaries = drama.commentaries;
    res.render("drama/show", {isAdmin, drama, commentaries})
})

router.get("/drama/:id/commentary/new", async (req, res) =>{
    drama = await Drama.findById(req.params.id)
    res.render("shared/commentary/new", {item: drama})
})

router.get("/drama/:id/commentary/:commentaryId", async (req, res) =>{
    drama = await Drama.findById(req.params.id)
    for (const commentary of commentaries) {
        if (commentary.id == req.params.commentaryId) {
            res.render("shared/commentary/show", {commentary})
        }
    }
})

router.get("/drama/:id/edit", isAdmin, async (req, res) =>{
    drama = await Drama.findById(req.params.id)
    res.render("drama/edit", {drama})
})

router.post('/drama/new', upload.single('cover'), isAdmin, (req, res)=>{
    let genres = []
    if (req.body.genres) {
        genres = req.body.genres.split(',');
    }
    data = {
        name:         req.body.name,
        director:     req.body.director,
        year:         req.body.year,
        genres:       genres,
        recurrence:   0,
        stars:        0,
        lines:        [],
        commentaries: [],
        haveWatched:  false,
        itemType: "drama"
    }

    if(req.file !== undefined) {
        data.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    Drama.create(data)
    .then((drama) => {
        console.log(drama)
        res.redirect(`/drama/${drama._id}/show?isAdmin=true`);
    })
    .catch((error) => {
        console.error('Failed to create a new drama', error)
    })
})

router.put("/drama/:id", upload.single('cover'), isAdmin, async (req, res)=>{
    const { id } = req.params
    const newData = req.body

    // Update haveWatched
    if(newData.haveWatched){
        newData.haveWatched = true
        newData.recurrence = 1
    }
    // Update lines
    if(newData.add_line){
        const drama = await Drama.findById(req.params.id)
        newData.lines = [...drama.lines]
        newData.lines.push(newData.add_line)
    }
    if(newData.delete_line){
        const drama = await Drama.findById(req.params.id)
        newData.lines = [...drama.lines]
        newData.lines.splice(newData.delete_line, 1)
    }
    // Update genres
    let genres = []
    if (req.body.genres) {
        genres = req.body.genres.split(',');
    }
    genres.length > 0 && (newData.genres = genres);
    // Update recurrence
    if(newData.recurrence) {
        newData.recurrence = parseInt(newData.recurrence)
    }
    // Update image
    if(req.file !== undefined) {
        newData.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    const drama = await Drama.findByIdAndUpdate(id, req.body)
    res.redirect(`/drama/${drama._id}/show?isAdmin=true`)
})

router.put("/drama/:id/commentary/new", isAdmin, async (req, res) =>{
    const newData = req.body

    if(newData.title && newData.content) {
        const drama = await Drama.findById(req.params.id)
        newData.commentaries = [...drama.lines]
        newData.commentaries.push(
            {
                id: Math.random().toString(16).slice(2),
                title: newData.title,
                content: newData.content
            }
        )
    }

    await Drama.findByIdAndUpdate(req.params.id, req.body)
    res.redirect(`/drama/${drama._id}/show?isAdmin=true`)
})

router.delete("/drama/:id", isAdmin, async (req, res) =>{
    const { id } = req.params
    await Drama.findByIdAndDelete(id)
    res.redirect("/")
})

/* =================== Records =================== */
router.get("/record/new", isAdmin, (req, res)=>{
    res.render("record/new")
})

router.get("/record/index", async (req, res)=>{
    records = await Record.find({})
    res.render("record/index", {records})
})

router.get("/record/:id/show", async (req, res) =>{
    const isAdmin = req.query.isAdmin === 'true';
    record = await Record.findById(req.params.id)
    res.render("record/show", {isAdmin, record})
})

router.get("/record/:id/edit", isAdmin, async (req, res) =>{
    record = await Record.findById(req.params.id)
    res.render("record/edit", {record})
})

router.post('/record/new', upload.single('cover'), isAdmin, (req, res)=>{
    data = {
        name:         req.body.name,
        artist:       req.body.artist,
        genre:        req.body.genre,
        medium:       req.body.medium,
        year:         req.body.year,
        stars:        0,
        comments:     [],
        owned:        false,
        itemType:     "record"
    }

    if(req.file !== undefined) {
        data.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    Record.create(data)
    .then((record) => {
        console.log(record)
        res.redirect(`/record/${record._id}/show?isAdmin=true`);
    })
    .catch((error) => {
        console.error('Failed to create a new record', error)
    })
})

router.put("/record/:id", upload.single('cover'), isAdmin, async (req, res)=>{
    const { id } = req.params
    const newData = req.body

    // Update/Toggle owned
    if(newData.owned){
        newData.owned = true
    }
    if(newData.already_owned) {
        newData.owned = false
    }

    const record = await Record.findByIdAndUpdate(id, req.body)
    res.redirect(`/record/${record._id}/show?isAdmin=true`)
})

router.delete("/record/:id", async (req, res) =>{
    const { id } = req.params
    await Record.findByIdAndDelete(id)
    res.redirect("/")
})

/* =================== Games =================== */
router.get("/game/new", isAdmin, (req, res)=>{
    res.render("game/new")
})

router.get("/game/index", async (req, res)=>{
    games = await Game.find({})
    res.render("game/index", {games})
})

router.get("/game/:id/show", async (req, res) =>{
    const isAdmin = req.query.isAdmin === 'true';
    game = await Game.findById(req.params.id)
    res.render("game/show", {isAdmin, game})
})

router.get("/game/:id/edit", isAdmin, async (req, res) =>{
    game = await Game.findById(req.params.id)
    res.render("game/edit", {game})
})

router.post('/game/new', upload.single('cover'), isAdmin, (req, res)=>{
    data = {
        name:         req.body.name,
        developer:    req.body.developer,
        genre:        req.body.genre,
        year:         req.body.year,
        stars:        0,
        comments:     [],
        havePlayed:   false,
        itemType:     "game"
    }

    if(req.file !== undefined) {
        data.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    Game.create(data)
    .then((game) => {
        console.log(game)
        res.redirect(`/game/${game._id}/show?isAdmin=true`);
    })
    .catch((error) => {
        console.error('Failed to create a new game', error)
    })
})

router.put("/game/:id", upload.single('cover'), isAdmin, async (req, res)=>{
    const { id } = req.params
    const newData = req.body

    // Update havePlayed
    if(newData.havePlayed){
        newData.havePlayed = true
    }
    // Update image
    if(req.file !== undefined) {
        newData.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    const game = await Game.findByIdAndUpdate(id, req.body)
    res.redirect(`/game/${game._id}/show?isAdmin=true`)
})

router.delete("/game/:id", isAdmin, async (req, res) =>{
    const { id } = req.params
    await Game.findByIdAndDelete(id)
    res.redirect("/")
})

/* =================== Channels =================== */
router.get("/channel/new", isAdmin, (req, res)=>{
    res.render("channel/new")
})

router.get("/channel/index", async (req, res)=>{
    channels = await Channel.find({})
    res.render("channel/index", {channels})
})

router.get("/channel/:id/show", async (req, res) =>{
    const isAdmin = req.query.isAdmin === 'true';
    channel = await Channel.findById(req.params.id)
    commentaries = channel.commentaries
    res.render("channel/show", {isAdmin, channel, commentaries})
})

router.get("/channel/:id/edit", isAdmin, async (req, res) =>{
    channel = await Channel.findById(req.params.id)
    res.render("channel/edit", {channel})
})

router.get("/channel/:id/commentary/new", isAdmin, async (req, res) =>{
    channel = await Channel.findById(req.params.id)
    res.render("shared/commentary/new", {item: channel})
})

router.get("/channel/:id/commentary/:commentaryId", async (req, res) =>{
    const isAdmin = req.query.isAdmin === 'true'; // Convert to boolean
    channel = await Channel.findById(req.params.id)
    for (const commentary of commentaries) {
        if (commentary.id == req.params.commentaryId) {
            res.render("shared/commentary/show", {isAdmin, channel, commentary})
        }
    }
})

router.get("/channel/:id/commentary/:commentaryId/edit", isAdmin, async (req, res) =>{
    channel = await Channel.findById(req.params.id)
    for (const commentary of commentaries) {
        if (commentary.id == req.params.commentaryId) {
            res.render("shared/commentary/edit", {channel, commentary})
        }
    }
})

router.put("/channel/:id/commentary/new", isAdmin, async (req, res) =>{
    const newData = req.body
    if(newData.title && newData.content) {
        const channel = await Channel.findById(req.params.id)
        newData.commentaries = [...channel.commentaries]
        newData.commentaries.push(
            {
                id: Math.random().toString(16).slice(2),
                title: newData.title,
                content: newData.content
            }
        )
    }

    await Channel.findByIdAndUpdate(req.params.id, req.body)
    res.redirect(`/channel/${channel._id}/show?isAdmin=true`)
})

router.put("/channel/:id/commentary/:commentaryId/edit", isAdmin, async (req, res) =>{
    const newData = req.body
    if(newData.title || newData.content) {
        const channel = await Channel.findById(req.params.id)
        newData.commentaries = [];
        channel.commentaries.forEach((commentary) => {
            if(commentary.id == req.params.commentaryId) {
                const newTitle = newData.title ? newData.title : commentary.title
                const newContent = newData.content ? newData.content : commentary.content
                newData.commentaries.push(
                    {
                        id: commentary.id,
                        title: newTitle,
                        content: newContent
                    }
                )
            } else {
                newData.commentaries.push(commentary)
            }
        })
    }

    await Channel.findByIdAndUpdate(req.params.id, req.body)
    res.redirect(`/channel/${channel._id}/show?isAdmin=true`)
})

router.delete("/channel/:id/commentary/:commentaryId", async (req, res) =>{
    const newData = req.body
    const channel = await Channel.findById(req.params.id)
    newData.commentaries = [];
    channel.commentaries.forEach((commentary) => {
        if(commentary.id != req.params.commentaryId) {
            newData.commentaries.push(commentary)
        }
    })

    await Channel.findByIdAndUpdate(req.params.id, req.body)
    res.redirect(`/channel/${channel._id}/show?isAdmin=true`)
})

router.post('/channel/new', upload.single('cover'), isAdmin, (req, res)=>{
    let platforms = []
    if (req.body.platforms) {
        platforms = req.body.platforms.split(',');
    }
    let genres = []
    if (req.body.genres) {
        genres = req.body.genres.split(',');
    }

    data = {
        name:         req.body.name,
        influencer:   req.body.influencer,
        platforms:    platforms,
        genres:       genres,
        stars:        0,
        comments:     [],
        haveWatched:  false,
        itemType:     "channel"
    }

    if(req.file !== undefined) {
        data.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    Channel.create(data)
    .then((channel) => {
        console.log(channel)
        res.redirect(`/channel/${channel._id}/show?isAdmin=true`);
    })
    .catch((error) => {
        console.error('Failed to create a new channel', error)
    })
})

router.put("/channel/:id", upload.single('cover'), isAdmin, async (req, res)=>{
    const { id } = req.params
    const newData = req.body

    let platforms = []
    if (req.body.platforms) {
        platforms = req.body.platforms.split(',');
    }
    let genres = []
    if (req.body.genres) {
        genres = req.body.genres.split(',');
    }

    // Update havePlayed
    if(newData.haveWatched){
        newData.haveWatched = true
    }
    // Update platforms
    platforms.length > 0 && (newData.platforms = platforms);
    // Update genres
    genres.length > 0 && (newData.genres = genres);
    // Update image
    if(req.file !== undefined) {
        newData.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    const channel = await Channel.findByIdAndUpdate(id, req.body)
    res.redirect(`/channel/${channel._id}/show?isAdmin=true`)
})

router.delete("/channel/:id", async (req, res) =>{
    const { id } = req.params
    await Channel.findByIdAndDelete(id)
    res.redirect("/")
})

/* =================== Softwares =================== */
router.get("/software/new", isAdmin, (req, res)=>{
    res.render("software/new")
})

router.get("/software/index", async (req, res)=>{
    softwares = await Software.find({})
    res.render("software/index", {softwares})
})

/* =================== Podcasts =================== */
router.get("/podcast/new", isAdmin, (req, res)=>{
    res.render("podcast/new")
})

router.get("/podcast/index", async (req, res)=>{
    podcasts = await Podcast.find({})
    res.render("podcast/index", {podcasts})
})

router.get("/podcast/:id/show", async (req, res) =>{
    const isAdmin = req.query.isAdmin === 'true';
    podcast = await Podcast.findById(req.params.id)
    res.render("podcast/show", {isAdmin, podcast})
})

router.get("/podcast/:id/edit", isAdmin, async (req, res) =>{
    podcast = await Podcast.findById(req.params.id)
    res.render("podcast/edit", {podcast})
})

router.post('/podcast/new', upload.single('cover'), isAdmin, (req, res)=>{
    data = {
        name:         req.body.name,
        host:         req.body.host,
        stars:        0,
        comments:     [],
        haveListened: false,
        itemType:     "podcast"
    }

    if(req.file !== undefined) {
        data.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    Podcast.create(data)
    .then((podcast) => {
        console.log(podcast)
        res.redirect(`/podcast/${podcast._id}/show?isAdmin=true`);
    })
    .catch((error) => {
        console.error('Failed to create a new podcast', error)
    })
})

router.put("/podcast/:id", upload.single('cover'), isAdmin, async (req, res)=>{
    const { id } = req.params
    const newData = req.body

    // Update haveListened
    if(newData.haveListened){
        newData.haveListened = true
    }
    // Update image
    if(req.file !== undefined) {
        newData.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    const podcast = await Podcast.findByIdAndUpdate(id, req.body)
    res.redirect(`/podcast/${podcast._id}/show?isAdmin=true`)
})

router.delete("/podcast/:id", async (req, res) =>{
    const { id } = req.params
    await Podcast.findByIdAndDelete(id)
    res.redirect("/")
})

module.exports = router