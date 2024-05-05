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
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});

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
        res.redirect('/books');
    } catch (error) {
        renderNewPage(res, book, true, error);
    }
});



function saveCover(book, coverEncoded) {
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover !== null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

async function renderNewPage(res, book, hasError = false, error = null) {
    try {
        const authors = await Author.find({});
        const param = {
            authors: authors,
            book: book
        };
        if (hasError) {
            param.errorMessage = 'Error creating book';
        }
        res.render('books/new', param);
    } catch (err) {
        console.error(err);
        res.redirect('/books');
    }
}

module.exports = router;
