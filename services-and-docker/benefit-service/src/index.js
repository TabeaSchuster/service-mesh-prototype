const express = require('express')
const bodyParser = require('body-parser')
const http = require("http");
const app = express()
const port = 3004
app.use(bodyParser.json())

let portCouponService = process.env.COUPON_SERVICE_SERVICE_PORT_HTTP; //COUPON_SERVICE_SERVICE_PORT_HTTP
let hostUrlCouponService = process.env.COUPON_SERVICE_SERVICE_HOST; //"http://localhost:3001/health"; //"http://"+hostName+":"+portNumber; //
// "http://" +
let prefix = "/benefits";

app.get( prefix + '/health', (req, res) => {
    console.log('hello, debug test 1')
    console.log('request',req)
    res.send('Benefit-Service is healthy')
})

// const validVoucherCodes = ["HAMMER-1", "EIMER-2", "NASSSAUGER-3"];
const validVoucherCodes = [
    {code: "HAMMER-1", couponType: "FreeProduct"},
    {code: "EIMER-2", couponType: "FreeProduct"},
    {code: "SCHNELLE-HAMSTER-RABATT-5-EURO", couponType: "FixedValueCoupon"},
    {code: "XXL-RABATT-15-PROZENT", couponType: "PercentageCoupon"},
]

// POST benefits/activation?userId={{myUserId}}
app.post( prefix + '/activation',  async (req, res) => {
    try {
        // // TODO: user-id  in future version from JWT
        let userId = req.query.userId;
        let voucherCode = req.body.voucherCode;
        let voucher = validVoucherCodes.find(obj => obj.code === voucherCode);

        if (!voucher){
            res.writeHead(404, {'Content-type': 'application/json'})
            res.end(JSON.stringify({error: 'There is no valid voucher-code for '+voucherCode}))
        }

        let data = JSON.stringify({
            "couponDetail1":"Some string",
            "couponDetail2": "2023-08-06",
            "type": voucher.couponType
        });
        const options = {
            hostname: hostUrlCouponService,
            port: portCouponService,
            path: "/coupons/create-coupon/"+userId,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            },
        }

        const _req = http
            .request(options, (_res) => {
                let rawData = '';

                _res.on('data', (chunk) => { rawData += chunk.toString(); });
                _res.on('end', () => {

                    try {
                        res.setHeader("Content-Type", "application/json");
                        res.write(
                            JSON.stringify({
                                additionalMessage: 'Hi, called coupon service from benefit!',
                                method: req.method,
                                url: req.url,
                                headers: req.headers,
                                body:  rawData.toString(),
                            })
                        );
                        res.end();
                    } catch (e) {
                        console.error(e.message);
                    }
                });
            });
        _req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });
        _req.write(data);
        _req.end();


    } catch (e) {
        console.log('Could not call coupon service',e);
        console.log('process.env:' , process.env);
    }
})

app.listen(port, () => {
    console.log(`Benefit-Service listening on port ${port}`)
})
