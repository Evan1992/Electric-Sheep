/*
 * 
 */
const express = require("express"),
      router  = express.Router(),
      Book    = require("../models/book"),
      fs      = require("fs"),
      multer  = require("multer"),
      upload  = multer({dest: 'uploads/'})

/*
 * Upload the image to mongodb
 *
 * Packages
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
 *      
 */
router.post('/add-book', upload.single('cover'), (req, res)=>{
    // req.file is the 'cover' file
    // req.body will hold the text fields, if there were any
    console.log(req.body);
    console.log(req.file);

    data = {
        name:    req.body.name,
        author:  req.body.author,
        press:   req.body.press,
        ISBN:    req.body.ISBN,
        cover: {
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
    res.redirect("/add-book");
})

router.get("/add-book", (req, res)=>{
    res.render("addBook.ejs")
});

module.exports = router;