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
      fs             = require("fs"),
      multer         = require("multer"),
      upload         = multer({dest: 'uploads/'})
      
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
router.post('/book/new', upload.single('cover'), (req, res)=>{
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
        extract: []
    }

    if(req.file !== undefined) {
        data.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    Book.create(data, (err, book)=>{
        if(err){
            console.log(err)
        }else{
            console.log(book)
        }
    })
    res.redirect("/book/new");
})
router.get("/book/new", (req, res)=>{
    res.render("book/new")
})


/**
 * 
 */
router.get("/book/index/:have_read", async (req, res)=>{
    allBooks = await Book.find({})
    const haveRead = (req.params.have_read === 'have_read')
    res.render("book/index", {allBooks, haveRead})
})

router.get("/book/:id/show", async (req, res) =>{
    book = await Book.findById(req.params.id)
    res.render("book/show", {book})
})

router.get("/book/:id/edit", async (req, res) =>{
    book = await Book.findById(req.params.id)
    res.render("book/edit", {book})
})

/**
 * @Note
 *  Don't forget to add upload, otherwise, req.body is empty.    
 */
router.put("/book/:id", upload.single('cover'), async (req, res)=>{
    const { id } = req.params
    const newData = req.body

    // Update haveRead
    if(newData.haveRead){
        newData.haveRead = true
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

    const book = await Book.findByIdAndUpdate(id, req.body)
    res.redirect(`/book/${book._id}/show`)
})

router.delete("/book/:id", async (req, res) =>{
    const { id } = req.params
    await Book.findByIdAndDelete(id)
    res.redirect("/")
})

/* =================== Drama =================== */
router.get("/drama/new", (req, res)=>{
    res.render("drama/new")
})

router.post('/drama/new', upload.single('cover'), (req, res)=>{
    data = {
        name:        req.body.name,
        director:    req.body.director,
        year:        req.body.year,
        recurrence:  0,
        stars:       0,
        lines:       [],
        comments:    [],
        haveWatched: false,
    }

    if(req.file !== undefined) {
        data.cover = {
            img_data: fs.readFileSync(req.file.path),
            contentType: String
        }
    }

    Drama.create(data, (err, drama)=>{
        if(err){
            console.log(err)
        }else{
            console.log(drama)
        }
    })
    res.redirect("/drama/new")
})

module.exports = router