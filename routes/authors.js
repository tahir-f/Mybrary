const express = require('express');
const router= express.Router();
const Author = require('../models/author')
const Book = require('../models/book');

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
        res.redirect(`/authors/${newAuthor.id}`)

    } catch (err) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        })

    }
    
})

router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id}).limit(6).exec()

        res.render('authors/show',
            {
                author: author,
                booksByAuthor: books
            }
        )


    } catch {
        res.redirect('/')
    }

})

router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', {author: author})
        
    } catch {
        res.redirect('/authors')
    }

})
// we use put when working with rest
router.put('/:id', async (req, res)=>{
    let author  // defining outside to access inside catch block
    try {
        const author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)

    } catch (err) {

        if (author == null) {
            res.redirect('/')
        } else {

            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating the author'
            })
        }

    }
    
})

router.delete('/:id', async (req, res) => {
    
    let author
    try {
        author = await Author.findById(req.params.id);
        console.log(author); // Log the value of author to inspect it
        if (!author) {
            // If author is not found, redirect to home page
            res.redirect('/');
            return;
        }

        // Check if there are associated books
        const books = await Book.find({ author: author.id }).exec();
        if (books.length > 0) {
            // If there are associated books, redirect to the author's page
            res.redirect(`/authors/${author.id}`);
            return;
        }


        // Attempt to remove the author from the database
        await author.deleteOne(); // Use deleteOne() instead of remove()
        res.redirect('/authors');
    } catch (error) {
        if (author == null) {
           res.redirect('/')
        } else {
            res.redirect(`authors/${author.id}`)
       }
    }
});





// router.delete('/:id',async (req, res)=>{
//     let author
//     try {
//         const author = await Author.findById(req.params.id)
//         await author.remove()
//         res.redirect('/authors')

//     } catch {

//         if (author == null) {
//             res.redirect('/')
//         } else {

//             res.redirect(`authors/${author.id}`)
//         }

//     }
// })



module.exports = router