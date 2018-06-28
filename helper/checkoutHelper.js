/**
 * Created by kanarasimhan on 6/28/2018.
 */
'use strict';

var checkoutHelper = {};
var buyer = require('../constants/constants.json').buyer;
var checkoutDetails = require('../constants/constants.json').checkoutDetails;
var createPaymentReqBody =require('../constants/constants.json').createPaymentReqBody;
var request = require("request");
checkoutHelper.getBuyerInfo = function getBuyerInfo(){
    return buyer;
};


checkoutHelper.createPayments = function createPayments(req, res){
    getAccessToken(function(err, accessTokenRes, accessTokenbody){
        console.log(err);
        if(err){
            res.render('error', {'message':'error occurred during create payments : getAccessToken', 'error':err});
            return;
        }
        var accessToken = JSON.parse(accessTokenbody).access_token;
        var reqBody = createPaymentReqBody;
        var data = req.body;
        reqBody.transactions[0].item_list.shipping_address.recipient_name= data.firstName+" "+data.lastName;
        reqBody.transactions[0].item_list.shipping_address.line1= data.line1;
        reqBody.transactions[0].item_list.shipping_address.line2= data.line2;
        reqBody.transactions[0].item_list.shipping_address.city= data.city;
        reqBody.transactions[0].item_list.shipping_address.country_code= data.country;
        reqBody.transactions[0].item_list.shipping_address.postal_code= data.zip;
        reqBody.transactions[0].item_list.shipping_address.phone= data.phone;
        reqBody.transactions[0].item_list.shipping_address.state= data.state;
        reqBody.transactions[0].invoice_number += Math.floor(Math.random()*90000) + 10000;
        reqBody.redirect_urls.cancel_url = req.headers.host+'/userInfo';
        reqBody.redirect_urls.return_url = req.headers.host+'/';
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
        console.log(reqBody);
        request(options, function (error, response, body) {
            if (err) {
                console.log('Error when calling create payment');
                res.render('error', {'message':'Error when calling create payment', 'error':err});
                return;
            }
                //console.log(body);
                res.send(body);
        });
    });
};
checkoutHelper.executePayments = function executePayments(req, res){
    getAccessToken(function(err, accessTokenRes, accessTokenbody){
        console.log(err);
        if(err){
            res.render('error', {'message':'error occurred during executePayments : getAccessToken', 'error':err});
            return;
        }
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

        request.post(options, function (error, response, body) {
            if (err) {
                console.log('Error when calling execute payment');
                res.render('error', {'message':'Error when calling execute payment', 'error':err});
                return;
            }
            console.log(body);
            res.send(body);
        });
    });
};


function getAccessToken(callback){

    console.log('get access token start');
    var token  = checkoutDetails.clientId+":"+checkoutDetails.secretPhrase,
        encodedKey = new Buffer(token).toString('base64');
    console.log(encodedKey);
      //var  payload = "grant_type=client_credentials&Content-Type=application%2Fx-www-form-urlencoded&response_type=token&return_authn_schemes=true";
    var  payload = "grant_type=client_credentials&Content-Type=application%2Fx-www-form-urlencoded";

    var options = {
        url: checkoutDetails.getAccessTokenUrl,
        headers: {
            'authorization': "Basic "+encodedKey,
            'content-type': "application/x-www-form-urlencoded",
            'PayPal-Partner-Attribution-Id' : checkoutDetails.BN_CODE
        },
        body:"grant_type=client_credentials"
    }
    //console.log(options);
    request.post(options, function (error, response, body) {
        console.log(error);
        if (error) {
            console.log('error occurred during get access token');
            callback(error);
        }
        else{
            callback('',response,body);
        }
    });
}
module.exports = checkoutHelper;