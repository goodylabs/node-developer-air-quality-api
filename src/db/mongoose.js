/**
 * Establishing the database connection
 */

const mongoose = require('mongoose');
const config = require('config');
const dbpath = config.get('dbpath');

mongoose.connect(dbpath, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
});
