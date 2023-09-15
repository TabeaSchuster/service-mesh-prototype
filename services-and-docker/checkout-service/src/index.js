const express = require('express')
const bodyParser = require('body-parser')
const http = require("http");
const app = express()
const port = 3005
app.use(bodyParser.json())


// todo: beschreiben, dass nicht mit docker sondern direkt mit node (node vorher installieren auf maschiene)
// todo: cd ba-prototype/checkout-service
// todo  node src/index.js
// todo ssh -i ~/.ssh/tschuster_ba ubuntu@3.67.221.220 -N -L 3005:localhost:3005

const prefix = "/checkout";
let hostUrlReceiptService = "10.97.53.100"//use $INGRESS_HOST // process.env.RECEIPT_SERVICE_SERVICE_HOST; // "10.105.250.85"; //
let portReceiptService =  "80";//use $INGRESS_PORT //process.env.RECEIPT_SERVICE_SERVICE_PORT_HTTP; //80;
let pathReceiptService= "/receipts/receipts";
// -e RECEIPT_SERVICE_SERVICE_HOST="" -e RECEIPT_SERVICE_SERVICE_PORT_HTTP=""
// "10.97.53.100"; // 80

// TODO beim bau des docker als variable mitgeben? abhängig von gateway api
// hostname:  hostUrlReceiptService,
//     port: portReceiptervice,

app.get('/', (req, res) => {
    console.log('debug 11');
    res.send('Hello World from Checkout-Service!')
})

app.get('/health', (req, res) => {
    console.log('debug 12');
    res.send('Checkout-Service is healthy')
})

app.post(prefix + '/receipts', async (req, res) => {
    let receipt = req.body.receipt;
    console.log('debug 1');
    try {
        const result = await callReceiptService(receipt);
        console.log('result', result);

        res.writeHead(200, {'Content-type': 'application/json'});
        res.end(JSON.stringify({message: ' Successfully called receipt service'}));
    } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, {'Content-type': 'application/json'});
        res.end(JSON.stringify({error: ' Could not call receipt service'}));
    }

}  );


function callReceiptService(receipt) {
    return new Promise((resolve, reject) => {
        console.log('debug 2');
        let data = JSON.stringify({
            "receipt": {
                "receiptId": "723456864",
                "userId": "user-1",
                "storeId": "store1",
                "transactionTimestamp": "2023-07-05T09:08:00",
                "sum": 70.00,
                "bonusPoints": 25,
                "positions": [
                    {
                        "productId": "3476",
                        "productName": "Lavender",
                        "amount": 2,
                        "singlePrice": 8.0
                    },
                    {
                        "productId": "3476",
                        "productName": "Garden Table",
                        "amount": 1,
                        "singlePrice": 54.0
                    }
                ]
            }
        });

        const options = {
            hostname: hostUrlReceiptService,
            port: portReceiptService,
            path: pathReceiptService,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlTmFtZSI6ImV4dGVybmFsLWNoZWNrb3V0LXNlcnZpY2UiLCJpYXQiOjE2OTMzMjk0MDQsImV4cCI6MTY5NDE5MzQwNCwiaXNzIjoiZXh0ZXJuYWwtY2hlY2tvdXQtc2VydmljZSIsInN1YiI6ImV4dGVybmFsLWNoZWNrb3V0LXNlcnZpY2UifQ.AK6dFZNVfbLMeK520a2jqXGy2DCQx8-6i3ijdjoyVaD47h-pqOJ9myNaqdRo056wzFzHUNg1Y4A6zC7c5cvHQtUWTFgwvcMlTeDOI8S6QXjyDxJF6OLsJDvWEGHzf6Hvb48G_YjQm_NypqLtVxthT9VKlfQb0pmlmFSKk-aACruUDgPMhp15MuKIT-YGYyAprUShr7MTqwX8QWat2GeZVeKmeH4Wj0ncsHp9yYOCn2jjaZ2Cyih7Ra2y6CVG0mgiUH7vYLJUicJ8YBl3LnciICQc2z11bsSgfDS2K9T7NuiwqYwucDnNSdH9i_u8hVLuG_ilK5WG5Ws2fLh7Uh2OMA'
            }
        };
        console.log('debug 3');
        const req = http.request(options, (response) => {
            console.log('debug 4');
            if (response.statusCode === 200) {
                console.log('debug 5');
                let responseData = '';
                response.on('data', (chunk) => {
                    responseData += chunk;
                });
                response.on('end', () => {
                    console.log('debug 6');
                    resolve(responseData);
                });

                console.log(JSON.stringify({
                    additionalMessage: 'Hi, called receipt service from checkout!',
                    body: responseData.toString(),
                }));

            } else {
                console.log('debug 7');
                reject(new Error(`Could call receipt service, received status code ${response.statusCode}`));
            }
        });

        req.on('error', (error) => {
            console.log('debug 8');
            reject(error);
        });
        console.log('debug 9');
        req.write(data);
        req.end();
        console.log('debug 10');
    });
}



app.listen(port, () => {
    console.log(`Checkout-Service listening on port ${port}`)
})