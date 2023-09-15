const http = require('http');
const express = require('express')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid');



//const got = require('got');
const app = express()

const port = 3001; // 8080
const HOST = '0.0.0.0';
//import got from 'got';
app.use(bodyParser.json())


// var hostName = process.env.FOOD_SERVER_SERVICE_HOST
// var portNumber = process.env.FOOD_SERVER_SERVICE_PORT_HTTP
// var hostUrl = "http://postman-echo.com/get?foo1=bar1&foo2=bar2"; //"http://"+hostName+":"+portNumber;
// var hostUrl2 = "http://localhost:3000/health";
// let prefix = "/coupons";

let hostName = process.env.RECEIPT_SERVICE_SERVICE_HOST;
let portNumber = process.env.RECEIPT_SERVICE_SERVICE_PORT_HTTP;
let hostUrl = "http://postman-echo.com/get?foo1=bar1&foo2=bar2"; //"http://"+hostName+":"+portNumber;
let hostUrl2 = "http://"+hostName+":"+portNumber; //"http://localhost:3001/health";

let hostNameUser = process.env.USER_SERVICE_SERVICE_HOST;
let portNumberUser = process.env.USER_SERVICE_SERVICE_PORT_HTTP;
let userServiceUrl = "http://"+hostNameUser+":"+portNumberUser+'/users'; // "http://localhost:3001/coupons/health" // "http://localhost:3001/health"; //curl -v coupon-service:3001/coupons/health

let prefix = "/coupons";


// Enum
const CouponType = Object.freeze({
    PercentageCoupon: 'PercentageCoupon',
    FixedValueCoupon: 'FixedValueCoupon',
    FreeProduct: 'FreeProduct'
})


app.get( prefix + '/health', (req, res) => {
    res.send('Coupon-Service is healthy !')
})

// post coupon-service/coupons/${userId}
app.post( prefix + '/create-coupon/:userId', async (req, res) => {
    console.log('coupon user id post: req ', req);
    console.log('coupon user id post:  req.params.userId ',  req.params.userId);
    let userId = req.params.userId;
    let couponDetail1 = req.body.couponDetail1; // StationaryCouponV2.yaml: - country - discountValue  - validFrom  - validUntil - title  - redeemType - participatingStores - restriction  - discountType
    let couponType = req.body.type;



    // let test = await userIsEligible(req, res, userId, couponType);
    // console.log('userIsEligible', test);
    //
    // // todo in zukunft so:
    // // check user-service, if user is eligible for coupon (type)
    // if (test) {// (userIsEligible(req, res, userId, couponType)) {
    //
    //     // created coupon (in eventstore)
    //     // with some coupon data (title, image, validUntil, campaign, ...)
    //     // and with personalized coupon-id
    //
    //
    //     return res.send('Created coupon for user with user-id ' + userId + ' with coupon id' + newCreatedCouponID
    //         + ' based on Details ' + couponDetail1 + ' and ' + couponDetail2
    //     );
    // }
    //
    // return res.send("User is not eligible for this coupon"); // e.g. because he is an employee and coupon of type percentage


    createCouponIfUserIsEligble(res, req, userId, couponType);


    // TODO müsste eigentlich auch im anderen Fall prüfen, ob User existiert




    console.log('debug 4');
    //  res.send("User is not eligible for this coupon"); // e.g. because he is an employee and coupon of type percentage
})

function createCouponIfUserIsEligble(res, req, userId, couponType) {
    try {
        console.log('debug 0.1');
        console.log('userId',userId);
        http.get(userServiceUrl+'/'+ userId, (_res) => {
            console.log('debug 0.2');
            let rawData = '';
            _res.on('data', (chunk) => {
                rawData += chunk;
            });
            _res.on('end', () => {
                try {

                    console.log('debug 0.3');
                    console.log("statusCode: ", _res.statusCode);
                    if( _res.statusCode ===404){
                        console.log('debug 5');
                        // e.g. because he is an employee and coupon of type percentage
                        res.writeHead(404, {'Content-type': 'application/json'});
                        return res.end(JSON.stringify({"message":'User does not exist ' + userId }));
                    }


                    // console.log('external-2-debug');
                    // console.log(rawData);
                    const parsedData = JSON.parse(rawData);
                    console.log(parsedData);
                    // does some stuff with this data and creates:
                    let newCreatedCouponID = uuidv4();

                    if(couponType === CouponType.PercentageCoupon ) {

                        console.log('rawData.isEmployee',parsedData.isEmployee);

                        if ( parsedData.isEmployee !== undefined && parsedData.isEmployee === false ) {
                            console.log('debug 1');


                            res.write(
                                JSON.stringify({
                                    additionalMessage: 'Hi, called user-service from coupon-service!',
                                    method: req.method,
                                    url: req.url,
                                    headers: req.headers,
                                    body: "isEmployee " +parsedData.isEmployee.toString() + " sucessfully created a new PercentageCoupon with id"+newCreatedCouponID, //parsedData.args.toString(), //
                                })
                            );
                            return res.end();
                        } else {
                            console.log('debug 2');
                            return res.send(JSON.stringify({"message":"User is not eligible for this coupon."}));

                        }
                    } else {
                        res.write(
                            JSON.stringify({
                                additionalMessage: 'Hi, called user-service from coupon-service!',
                                method: req.method,
                                url: req.url,
                                headers: req.headers,
                                body: "isEmployee " +parsedData.isEmployee.toString() + " sucessfully created a new coupon with id"+newCreatedCouponID, //parsedData.args.toString(), //
                            })
                        );
                        return  res.end();
                    }

                } catch (e) {
                    console.error(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });

    } catch (e) {
        console.log('Error while calling user service',e);
        console.log('process.env:' , process.env);
    }
}


app.listen(port,HOST, () => {
    console.log(`Coupon-Service listening on port ${port}`)
})