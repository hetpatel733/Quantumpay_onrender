const { login, validateToken, getUserData } = require('./login');
const { signup } = require('./signup');
const { contact } = require('./contact');
const { paymentFunction, CoinselectFunction, FinalpayFunction, checkstatus } = require('./payment');
const { authenticateUser } = require('./auth');
const { paymentinfo } = require('./paymentinfo');



module.exports = { login, validateToken, getUserData, signup, contact, paymentFunction, CoinselectFunction, FinalpayFunction, checkstatus, authenticateUser, paymentinfo };