const mongoose = require('mongoose');

const Schema = new mongoose.Schema({

    payid: {
        type: String,
        required: true,
        unique: true
    },
    order_id: {
        type: String,
        required: true
    },
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    type: {
        type: String,
        require: true
    },
    amnt: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    hash: {
        type: String,
        require: false
    }
}, { timestamps: true });


const Schema2 = new mongoose.Schema({
    order_id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    api: {
        type: String,
        require: true
    },
    amnt: {
        type: String,
        require: true
    },
    label: {
        type: String,
        require: true
    }
}, { timestamps: true });

const paymentlogschema = mongoose.model("payment_logs", Schema);
const ordersschema = mongoose.model("orders", Schema2);

module.exports = { paymentlogschema, ordersschema };