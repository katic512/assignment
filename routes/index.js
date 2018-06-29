var express = require('express');
var router = express.Router();
var checkoutHelper = require('../helper/checkoutHelper');
/* GET home page. */
router.get('/', function(req, res, next) {
    checkoutHelper.getItemsInfo(req, res);
});

// to get the buyer name and adddress details
router.get('/userInfo', function(req, res, next) {
    var model = {};
    model.buyer = checkoutHelper.getBuyerInfo();
    model.page = '- Buyer info';
    res.render('buyer_info', model);
});
// to get the buyer name and adddress details
router.post('/userInfo', function(req, res, next) {
    var model = {};
    model.buyer = checkoutHelper.getBuyerInfo();
    model.page = '- Buyer info';
    res.render('buyer_info', model);
});
// make create payment of paypal express check out
router.post('/createPayments', function(req, res, next) {
    var data = req.body;
    checkoutHelper.createPayments(req, res);
});
// make execute payment of paypal express check out
router.post('/executePayments', function(req, res, next) {
    var data = req.body;
    checkoutHelper.executePayments(req, res);
});
// on successfull transaction show transaction id
router.get('/successfulPayment', function(req, res, next) {
    var model = {};
    model.transactionId = req.query.transactionId;
    res.render('success',model);
});


module.exports = router;
