const express = require('express');
const router= express.Router();
const Author = require('../models/author')
let errorMessage;
// all author route
router.get('/', async (req, res) => {

    // search functionality
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== "") {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query})
        

    } catch {
        res.redirect('/')

    }
})

// new author route

router.get('/new', (req, res)=>{
    res.render('authors/new', {author: new Author()})
})


// creating author route

router.post('/', async (req,res) => {
    const author = new Author({
        name: req.body.name
    });
    try {

        const newAuthor = await author.save()
        // res.redirect(`authors/${newAuthor.id}`)
        res.redirect('authors')

    } catch (err) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        })

    }
    // let errorMessage; // Declare errorMessage variable
    
    // author.save()
    //     .then(newAuthor => {
    //         res.redirect('/authors');
    //     })
    //     .catch(err => {
    //         errorMessage = 'Error creating author'; // Assign value to errorMessage
    //         res.render('authors/new', {
    //             author: author,
    //             errorMessage: errorMessage // Pass errorMessage to the template
    //         });
    //     });

})

module.exports = router