if (process.env.NODE_ENV !== 'PRODUCTION') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index')
const authorsRouter = require('./routes/authors')

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))

//DB setup
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {});

mongoose.connection.on('error', error => console.error(error));
mongoose.connection.once('open', () => console.log('connected to mongoose'));

app.use('/', indexRouter);
app.use('/authors', authorsRouter);

app.listen(process.env.PORT || 3000);