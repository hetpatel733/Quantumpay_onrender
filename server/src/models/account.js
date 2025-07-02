const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    email: {
        type: String, required: true, unique: true, trim: true
    },
    password: {
        type: String, required: true, trim: true
    },
    name: {
        type: String, required: true,
    },
    type: {
        type: String, required: true, trim: true
    },
    verified: {
        type: Boolean, required: true
    },
    token: {
        type: String, default: null
    },
}, { timestamps: true });

const accounts = mongoose.model("accounts", Schema);

module.exports = { accounts };


// const bcrypt = require('bcrypt');
// Schema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });