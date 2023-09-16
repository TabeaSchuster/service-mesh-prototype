const express = require('express')
const bodyParser = require('body-parser')
const http = require("http");
const app = express()
const port = 3000
app.use(bodyParser.json())

// This service file contains the following parts:
    // Establish connection to message queue and subscribe
    // Read and write to MongoDb Database
    // Implementation of endpoints and call to other service


let MongoClient = require('mongodb').MongoClient
let url = process.env.MONGO_DB_URL;

let hostUrlCouponService = process.env.COUPON_SERVICE_SERVICE_HOST;
let portCouponService = process.env.COUPON_SERVICE_SERVICE_PORT_HTTP;
let prefix = "/bonus-booklets";

const validCoupons = [
    {couponId: "70ca8a24-0bf5-4127-8b1b-d90233gsn5ka", minPoints: 10, couponType: "FreeProduct"},
    {couponId: "1a638a24-0bf5-4127-je9w-73nsd4d7369a", minPoints: 20, couponType: "FreeProduct"},
    {couponId: "04n8zal6-ke92-4127-50h2-d9jm3jhd28gw", minPoints: 30, couponType: "FixedValueCoupon"},
    {couponId: "93ndh4la-0bf5-2846-l835h-b5ke04d738s", minPoints: 50, couponType: "PercentageCoupon"},
    {couponId: "82nd8lei-kri3-a92h-kwb3-d90233d783ns", minPoints: 70, couponType: "PercentageCoupon"},
]


// Establish connection to message queue and subscribe

const amqp = require("amqp-connection-manager");

const { rabbitmqUrl, queue, exchange, routingKey } = require("./setup");

let channelWrapper;
let connection;


const handleMessage = (channelWrapper) => (message) => {
    let content = message.content;
    content = content.toString("utf-8");
    try {
        content = JSON.parse(content);
    } catch (error) {}
    console.dir(
        { msg: "received message: ", message: { ...message, content } },
        { depth: 5 }
    );
    writeToMongoDB(content.data, content.data.receiptId, "receipt").then(r => {
            channelWrapper.ack(message);
        }
    );

};

const messageQueueConnection = (async () => {
    connection = amqp.connect([rabbitmqUrl.toString()]);

    channelWrapper = connection.createChannel({
        json: true,
        setup: async (channel) => {
            await Promise.all([
                channel.assertExchange(exchange, "direct"),
                channel.assertQueue(queue, { durable: true }),
                channel.prefetch(1),
                channel.bindQueue(queue, exchange, routingKey),
                channel.consume(queue, handleMessage(channelWrapper)),
            ]);
        },
    });
    await channelWrapper.waitForConnect();

    process.on('SIGINT', closeConnections)
    process.on('SIGTERM', closeConnections)
})();

function closeConnections () {
    console.log("stopping message queue connection");
    channelWrapper.close();
    connection.close();
    // stop express
    console.log('end process: stop express');
    process.exit();
}


// write to database
async function writeToMongoDB( transaction, transactionId, transactionType) {

    // transaction: would do some validation of transaction data, but simplified in prototype

    const client = new MongoClient(url);
    try {

        const points = transaction.bonusPoints;
        const newTransaction =  {
            "transactionId" : transactionId,
            "timestamp" : transaction.transactionTimestamp,
            "type" : transactionType,
            "points" : points
        };
        const database = client.db("test");
        const collection = database.collection("bonusbooklet");

        const entryExists = await collection.findOne({ user: transaction.userId });
        console.log(entryExists);
        if ( entryExists===null ) {
            await collection.insertOne({
                "user": transaction.userId,
                "total-points": points,
                "transactions": [
                    {
                        newTransaction
                    }]
            });
        } else {
            await collection.updateOne(
                { user: transaction.userId },
                {
                    $push: {transactions: newTransaction},
                    $inc: { "total-points": points } // to decrease: use neg value
                }
            )
        }

    } catch (e) {
        console.log(e)
    } finally {
        await client.close();
    }
}

// write to database, redeem points
async function redeemPointsInMongoDB(userId, points) {

    const client = new MongoClient(url);
    try {
        const negPoints = Math.abs(points) * -1;
        const newTransaction =  {
            "transactionId" :  "some-uuid-7",
            "timestamp" : new Date().toISOString(),
            "type" : "redeemPoints",
            "points" : negPoints
        };
        const database = client.db("test");
        const collection = database.collection("bonusbooklet");

        const result = await collection.updateOne(
            { user: userId },
            {
                $push: {transactions: newTransaction},
                $inc: { "total-points": negPoints } // to decrease: use neg value
            }
        )
        console.log('result', result);
        if(result.matchedCount===1) {
            return true; // updated successfully
        } else {
            return false; // update failed
        }


    } catch (e) {
        console.log(e)
    } finally {
        await client.close();
    }
}

async function getUsersBonusbookletDetailsFromMongoDB(userId){

    const client = new MongoClient(url);
    try {

        const database = client.db("test");
        const collection = database.collection("bonusbooklet");
        const bonusbooklet = await collection.findOne({ user: userId });
        console.log('result', bonusbooklet);
        return bonusbooklet;
    } catch (e) {

        console.log(e)
        return null;
    } finally {
        await client.close();
    }
}

// implementation of http-endpoints

app.get( prefix + '/health', (req, res) => {
    res.send('Bonus-Booklet-Service is healthy')
})


// /bonus-booklets/${bonusBookletId}/transactions?userId=${userId}
app.post(prefix + '/:bonusBookletId/transactions', (req, res) => {
    let userId = req.query.userId;
    let points = req.body.points;
    let reason = req.body.reason;
    let bonusBookletId = req.params.bonusBookletId;

    // would do some validation here, if this was not a prototype


    let manualTransaction = {
        "transactionId" : "some-uuid-7",
        "transactionTimestamp" :  new Date().toISOString(), //"2023-07-21T14:32:52Z",
        "type" : "manual",
        "bonusPoints" : points,
        "userId": userId
    }

    writeToMongoDB(manualTransaction, manualTransaction.transactionId, "manual").then(r => {
            console.log("wrote manual transaction to mongodb");
        }
    );

    res.send('Created transaction for bonusBookletId' +bonusBookletId +' with user-id '+userId + ' and added '+points+
        ' points for reason: '+reason)
})


//redeem benefit points to get coupon // claim coupon ("benefit activation")
app.post(prefix + '/:bonusBookletId/benefits', async (req, res) => {
    let userId = req.query.userId;
    let couponId = req.body.couponId;

    let coupon = validCoupons.find(obj => obj.couponId === couponId);
    console.log('1. coupon', coupon);
    if (!coupon) {
        res.writeHead(404, {'Content-type': 'application/json'})
        res.end(JSON.stringify({error: 'There is no valid coupon for ' + couponId}))
        return;
    }
    let minPoints = coupon.minPoints;
    console.log('2. minPoints', minPoints);

    let bonusbooklet = await getUsersBonusbookletDetailsFromMongoDB(userId);
    console.log('3. bonusbooklet', bonusbooklet);
    if (bonusbooklet === null || bonusbooklet.totalPoints < minPoints) {
        console.log('4. debug');
        res.writeHead(200, {'Content-type': 'application/json'});
        res.end(JSON.stringify({error: 'User does not have enough points or does not participate in bonusbooklet season.'}));
        return;
    }


    // call coupon service to claim coupon
    // post coupon-service/coupons/${userId}
    try {
        const result = await callCouponService(userId, coupon);
        console.log('Result from function b:', result);

        let updatedSuccessfully =  await redeemPointsInMongoDB(userId, minPoints);
        console.log('updatedSuccessfully',updatedSuccessfully);
        if(updatedSuccessfully) {
            console.log('6. debug');
            res.writeHead(200, {'Content-type': 'application/json'});
            res.end(JSON.stringify({message: 'Created coupon for user with user-id ' + userId + ' and couponId ' + couponId}));
        } else {
            console.log('6.b. debug');
            res.writeHead(500, {'Content-type': 'application/json'});
            res.end(JSON.stringify({error: 'Could not update users bonusbooklet'}));
        }
    } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, {'Content-type': 'application/json'});
        res.end(JSON.stringify({error: ' Could not create coupon for user with user-id ' + userId + ' and couponId ' + couponId}));
    }

})




function callCouponService(userId, coupon) {
    return new Promise((resolve, reject) => {

        let data = JSON.stringify({
            "couponDetail1": "Some string",
            "couponDetail2": "2023-08-06",
            "type": coupon.couponType
        });

        const options = {
            hostname:  hostUrlCouponService,
            port: portCouponService,
            path: "/coupons/create-coupon/" + userId,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (response) => {
            if (response.statusCode === 200) {
                let responseData = '';
                response.on('data', (chunk) => {
                    responseData += chunk;
                });
                response.on('end', () => {
                    resolve(responseData);
                });

            } else {
                console.log('request', response);
                reject(new Error(`Could not create coupon, received status code ${response.statusCode}`));
            }
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

app.listen(port, () => {
    console.log(`Bonus-Booklet-Service listening on port ${port}`)
})
