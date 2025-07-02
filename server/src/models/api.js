const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    api: {
        type: String,
        required: true
    },
    evm: {
        type: String,
        required: true
    }
}, { timestamps: true });

const apicheck = mongoose.model("account_api_addresses", Schema);

module.exports = { apicheck };