const { accounts } = require("../models/account");

const signup = async (req, res, app) => {
    try {
        let verified = false;
        const { name, email, password, type } = req.body;

        const emailExists = await accounts.findOne({ email });

        if (emailExists) {
            // Respond with JSON error, do not redirect
            return res.status(409).json({
                success: false,
                message: "Email already in use"
            });
        } else {
            const registerdata = new accounts({
                name, email, password, type, verified
            });
            await registerdata.save();
            // Respond with JSON success
            return res.status(201).json({
                success: true,
                message: "Signup successful. Please login to continue."
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    signup
};
