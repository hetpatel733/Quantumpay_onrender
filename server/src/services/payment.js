const { paymentlogschema, ordersschema } = require("../models/payment");
const { apicheck } = require("../models/api");

function randomnumber(length) {
    let result = '';
    const characters = '0123456789'; // Characters to choose from

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
async function Randompayid(length) {
    let payid = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        payid += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const payiddb = await paymentlogschema.findOne({ payid });
    while (payiddb) {
        payid = await Randompayid(5);
        payiddb = null;
    }
    return payid;
}

const paycompletedcall = async (payid, hash) => {
    await paymentlogschema.updateOne({ payid }, { $set: { status: "completed", hash } });
}

// Big Handlers Functions


const paymentFunction = async (api, order_id, res) => {
    const apifound = await apicheck.findOne({ api });
    const orderfound = await ordersschema.findOne({ order_id, api });
    if (!apifound) {
        return res.send("Oops! API is Wrong");
    } else if (!orderfound) {
        return res.send("Oops! Order ID is Wrong");
    } else {
        return res.redirect(`/payment/coinselect?api=${api}&order_id=${order_id}`);
    }
}

const CoinselectFunction = async (req, res, app) => {
    const { fname, lname, email, type, api, order_id } = req.body;

    let payid = await Randompayid(5);

    const addressfound = await apicheck.findOne({ api });
    const orderfound = await ordersschema.findOne({ order_id });

    if (!addressfound) {
        return res.send("Oops! API is Wrong");
    }

    if (!orderfound) {
        return res.send("Oops! Order ID is Wrong");
    }

    let amnt = orderfound.amnt;
    const address = addressfound.evm;

    // If no pending payment exists, create one with a fractional amount
    const baseAmount = Math.floor(amnt); // integer part of amount
    let fractionalAmount;
    let isUnique = false;
    const maxAttempts = 10;
    let attempt = 0;

    while (!isUnique && attempt < maxAttempts) {
        attempt++;
        const randomFraction = Math.random() * 0.009 + 0.02;
        fractionalAmount = parseFloat((baseAmount + randomFraction).toFixed(4));

        const existing = await paymentlogschema.findOne({
            amnt: fractionalAmount,
            status: "pending",
            order_id
        });

        if (!existing) isUnique = true;
    }

    if (!isUnique) {
        return res.send("Couldn't generate unique fractional amount. Please try again.");
    }

    const paymentlog = new paymentlogschema({
        payid,
        order_id,
        fname,
        lname,
        email,
        type,
        amnt: fractionalAmount,
        address,
        status: "pending",
        hash: null
    });

    await paymentlog.save();
    amnt = fractionalAmount;
    // Redirect with final details
    return res.redirect(`/payment/finalpayment?payid=${payid}`);
};


function toWei(amountStr) {
    const [whole, fraction = ""] = amountStr.split(".");
    const paddedFraction = (fraction + "0".repeat(18)).slice(0, 18);
    return BigInt(whole + paddedFraction);
}


const FinalpayFunction = async (req, res) => {
    const { payid } = req.query;
    const apipolygon = "Y1EGDU1IS7CK8YN2MFFAGY75KWXZMP94C2";

    try {
        let paymentdetails = await paymentlogschema.findOne({ payid });

        if (!paymentdetails) {
            return;
        }

        const { amnt, address } = paymentdetails;

        let attempt = 0;
        const maxAttempts = 30;
        const delay = 60000;

        const checkPayment = async () => {
            attempt++;

            try {
                const paymentres = await fetch(
                    `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${apipolygon}`
                );
                const data = await paymentres.json();

                if (!data.result || data.status !== "1") {
                } else {
                    for (let tx of data.result.slice(0, 10)) {
                        const txamnt = BigInt(tx.value);
                        const expectedValue = toWei(amnt);

                        if (
                            tx.to.toLowerCase() === address.toLowerCase() &&
                            txamnt === expectedValue
                        ) {

                            // Mark the DB
                            await paycompletedcall(payid, tx.hash);
                            return;
                        }
                    }
                }

                if (attempt < maxAttempts) {
                    setTimeout(checkPayment, delay);
                } else {
                    await paymentlogschema.updateOne({ payid }, { $set: { status: "failed" } });
                }
            } catch (err) {
                if (attempt < maxAttempts) {
                    setTimeout(checkPayment, delay);
                } else {
                    await paymentlogschema.updateOne({ payid }, { $set: { status: "failed" } });
                }
            }
        };

        checkPayment();

    } catch (error) {
        console.error("❌ Fatal error in FinalpayFunction:", error);
        if (!res.headersSent) {
            return res.status(500).send("Internal server error");
        }
    }
};

const checkstatus = async (req, res) => {
    const { payid } = req.query;

    if (!payid) {
        return res.status(400).json({ success: false, message: "Missing payid" });
    }

    try {
        const payment = await paymentlogschema.findOne({ payid });

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment ID not found" });
        } else {
            return res.status(200).json({
                success: true,
                payid: payment.payid,
                status: payment.status,
                order_id: payment.order_id,
                address: payment.address,
                type: payment.type,
                amount: payment.amnt,
                timestamp: payment.timestamp || null
            });
        }
    } catch (err) {
        console.error("❌ Error fetching payment status:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}



module.exports = { paymentFunction, CoinselectFunction, FinalpayFunction, checkstatus };