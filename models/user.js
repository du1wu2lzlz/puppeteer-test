//Mongo DB中的Collection

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    dataCrawled: Date
});

module.exports = mongoose.model('User', userSchema);