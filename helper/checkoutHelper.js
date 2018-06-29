/**
 * Created by kanarasimhan on 6/28/2018.
 */
'use strict';

var checkoutHelper = {};
var buyer = require('../constants/constants.json').buyer;
var checkoutDetails = require('../constants/constants.json').checkoutDetails;
var createPaymentReqBody =require('../constants/constants.json').createPaymentReqBody;
var items = require('../constants/constants.json').items;
var request = require('request');
var util = require('util');

// return buyer name and address from json file
checkoutHelper.getBuyerInfo = function getBuyerInfo(){
    return buyer;
};

// make create payment of paypal express check out
checkoutHelper.createPayments = function createPayments(req, res){

    getAccessToken(function(err, accessTokenRes, accessTokenbody){
        if(err){
            res.render('error', {'message':'error occurred during create payments : getAccessToken', 'error':err});
            return;
        }
        console.log('starting create Payments call...');
        var accessToken = JSON.parse(accessTokenbody).access_token;
        var reqBody = createPaymentReqBody;
        var data = req.body;
        //set the buyer name and address for shipping from client
        reqBody.transactions[0].item_list.shipping_address.recipient_name= data.firstName+" "+data.lastName;
        reqBody.transactions[0].item_list.shipping_address.line1= data.line1;
        reqBody.transactions[0].item_list.shipping_address.line2= data.line2;
        reqBody.transactions[0].item_list.shipping_address.city= data.city;
        reqBody.transactions[0].item_list.shipping_address.country_code= data.country;
        reqBody.transactions[0].item_list.shipping_address.postal_code= data.zip;
        reqBody.transactions[0].item_list.shipping_address.phone= data.phone;
        reqBody.transactions[0].item_list.shipping_address.state= data.state;
        reqBody.transactions[0].invoice_number += Math.floor(Math.random()*90000) + 10000;
        reqBody.redirect_urls.cancel_url = req.protocol + '://' + req.headers.host+'/userInfo';
        reqBody.redirect_urls.return_url = req.protocol + '://' + req.headers.host+'/';
        var options = {
            method: 'POST',
            url: checkoutDetails.createPaymentUrl,
            headers : {
                'content-type': "application/json",
                'authorization': "Bearer "+accessToken,
                'cache-control': "no-cache",
                'PayPal-Partner-Attribution-Id' : checkoutDetails.BN_CODE
            },
            body: reqBody,
            json:true

        }
        console.log('Printing request for create payment');
        console.log(util.inspect(options, false, null));
        request(options, function (error, response, body) {
            if (err) {
                console.log('Error when calling create payment');
                res.render('error', {'message':'Error when calling create payment', 'error':err});
                return;
            }
            console.log('Printing response for create payment');
            console.log(util.inspect(body, false, null));
            res.send(body);
        });
    });
};
// make execute payment of paypal express check out
checkoutHelper.executePayments = function executePayments(req, res){
    getAccessToken(function(err, accessTokenRes, accessTokenbody){
        console.log(err);
        if(err){
            res.render('error', {'message':'error occurred during executePayments : getAccessToken', 'error':err});
            return;
        }
        console.log('starting Execute Payments call...');
        var accessToken = JSON.parse(accessTokenbody).access_token;
        var prevReq = req.res.req;
        var payerId = prevReq.body.payerID;
        var paymentId = prevReq.body.paymentID;
        var options = {
            url:  checkoutDetails.executePaymentUrl.replace('{payment_id}', paymentId),
            headers : {
                'content-type': "application/json",
                'authorization': "Bearer "+accessToken,
                'cache-control': "no-cache",
                'PayPal-Partner-Attribution-Id' : checkoutDetails.BN_CODE
            },
            body: {'payer_id':payerId},
            json:true

        }
        console.log('Printing request for Execute Payments');
        console.log(util.inspect(options, false, null));
        request.post(options, function (error, response, body) {
            if (err) {
                console.log('Error when calling execute payment');
                res.render('error', {'message':'Error when calling execute payment', 'error':err});
                return;
            }
            console.log('Printing response for  Execute Payments');
            console.log(util.inspect(body, false, null));
            res.send(body);
        });
    });
};
//for loading home page which has items information
checkoutHelper.getItemsInfo = function getItems(req, res){
    console.log('starting get items info...');
    res.render('index', {'items':items});
};
// for rest api authentication get access token
function getAccessToken(callback){

    console.log('get access token starting .....');
    //client id and secret id are got from sandbox after creating a buyer account
    var token  = checkoutDetails.clientId+":"+checkoutDetails.secretPhrase,
        encodedKey = new Buffer(token).toString('base64');

    var options = {
        url: checkoutDetails.getAccessTokenUrl,
        headers: {
            'authorization': "Basic "+encodedKey,
            'content-type': "application/x-www-form-urlencoded",
            'PayPal-Partner-Attribution-Id' : checkoutDetails.BN_CODE
        },
        body:"grant_type=client_credentials"
    }
    console.log('Printing request for get Access token');
    console.log(util.inspect(options, false, null));
    request.post(options, function (error, response, body) {
        if (error) {
            console.log('error occurred during get access token');
            callback(error);
            return;
        }
        console.log('Printing response for  get Access token');
        console.log(util.inspect(body, false, null));
        callback('',response,body);
    });
}
module.exports = checkoutHelper;