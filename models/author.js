const mongoose = require('mongoose');
const Book = require('./book')
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        const books = await Book.find({ author: this._id }).exec(); // Use exec() to execute the query
        if (books.length > 0) {
            const error = new Error('This author has associated books and cannot be deleted.');
            error.statusCode = 400;
            throw error;
        }
        // If there are no associated books, continue with the removal process
        next();
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
});



// authorSchema.pre('remove', function(next) {
//     Book.find({ author: this.id }, (err, books) => {
//       if (err) {
//         next(err)
//       } else if (books.length > 0) {
//         next(new Error('This author has books still'))
//       } else {
//         next()
//       }
//     })
//   })

module.exports = mongoose.model('Author',authorSchema)