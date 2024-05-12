const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const { json } = require('body-parser');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];


// All Books route
router.get('/', async (req, res) => {
    let query = Book.find()
    if(req.query.title!=null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore!=null && req.query.publishedBefore != '') {
        query = query.lte('publishDate',req.query.publishedBefore )
    }
    if(req.query.publishedAfter!=null && req.query.publishedAfter != '') {
        query = query.gte('publishDate',req.query.publishedAfter )
    }
    try {
        const searchOptions = {
            title: req.query.title || ''
        };
        // const books = await Book.find(searchOptions);
        const books = await query.exec();
        res.render('books/index', { books: books, searchOptions: searchOptions });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

// New book route
// New book route
router.get('/new', async (req, res) => {
    try {
        const book = new Book(); // Create a new book object
        renderFormPage(res, book, 'new', false); // Pass the book object to the renderFormPage function
    } catch (error) {
        console.error(error);
        res.redirect('/books'); // Redirect to books index page if there's an error
    }
});


// router.get('/new', async (req, res) => {
//     const book = await Book.findById(req.params.id)
//     renderFormPage(res, book, 'new', false)
    
// });

// Creating book route
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });

    saveCover(book, req.body.cover)
    try {
        const newBook = await book.save();
        res.redirect(`/books/${newBook.id}`);
    } catch (error) {
        renderNewPage(res, book, true, error);
    }
});

// Show book route

router.get('/:id', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id)
                                .populate('author')
                                .exec()

        res.render('books/show', {book: book})
    } catch {
        res.redirect('/')
    }

})

// Edit book route
router.get('/:id/edit', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id)
        renderFormPage(res, book, 'edit', false)
    }

    catch (err){
        console.log(err)
        res.redirect('/')
    }
});

// Update book route
router.put('/:id', async (req, res) => {
    let book
    try {
    book= await Book.findById(req.params.id)
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if (req.body.cover!=null && req.body.cover!=''){

        saveCover(book, req.body.cover)
    }
        await book.save()
        res.redirect(`/books/${book.id}`);
    } catch (error) {
        if(book!=null){
            renderFormPage(res, book,'edit', true)
        }
        renderFormPage(res, book,'edit', true)

    }
});

router.delete('/:id', async (req,res)=> {
  let book;
  try{
    book = await Book.findById(req.params.id)
    await book.deleteOne()
    res.redirect('/books')

  } catch {
    if (book!=null){
        res.render(`/books/show`, {
            book: book,
            errorMessage: "Could not remove book"
        })
    } else{
        res.redirect('/')
    }
  } 
})





function saveCover(book, coverEncoded) {
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover !== null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}




async function renderFormPage(res, book,form, hasError = false, error = null) {
    try {
        const authors = await Author.find({});
        const param = {
            authors: authors,
            book: book
        };
        if (hasError) {
            param.errorMessage = (form === 'edit') ? 'Error editing book' : 'Error creating book';
        }
        res.render(`books/${form}`, param);
    } catch (err) {
        console.error(err);
        res.redirect('/books');
    }
}

module.exports = router;
