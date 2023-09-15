const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3003
app.use(bodyParser.json())

let prefix = "/receipts";

// for message queue
const amqp = require("amqp-connection-manager");
const { rabbitmqUrl, exchange, routingKey } = require("./setup");
//const data = process.argv.slice(2);
let channelWrapper;
let connection;

// REST http endpoints

app.get( prefix + '/health', (req, res) => {
    res.send('Receipt-Service is healthy')
})

app.post( prefix + '/receipts', async (req, res) => {
    let receiptData = req.body.receipt;
    // body: {
    //     "receipt": {
    //         "receiptId": "723456864",
    //             "userId": "user-1",
    //             "storeId": "store1",
    //             "transactionTimestamp": "2023-07-05T09:08:00",
    //             "sum": 70.00,
    //             "bonusPoints": 15,
    //             "positions": [
    //             {
    //                 "productId": "3476",
    //                 "productName": "Lavender",
    //                 "amount": 2,
    //                 "singlePrice": 8.0
    //             },
    //             {
    //                 "productId": "3476",
    //                 "productName": "Garden Table",
    //                 "amount": 1,
    //                 "singlePrice": 54.0
    //             }
    //         ]
    //     }
    // }
    let data = 'receipt received';
    await sendMessage(channelWrapper, receiptData);
    console.log('send Message to queue');
    res.send('Received receipt');
})

// message queue
// and server start & collection close

async function sendMessage(channelWrapper, data) {
    const now = new Date().toISOString();
    try {
        const message = { data, now };
        await channelWrapper.publish(exchange, routingKey, message);
        console.log(`successfully message ${now} sent`);
    } catch (error) {
        console.error(`sending message ${now} failed: ${error}`);
    }
}

(async () => {
    console.log('try to start service and to connect to message queue');
    console.log('process.env',process.env);
    console.log('rabbitmqUrl.toString()', rabbitmqUrl.toString());

    connection = amqp.connect([rabbitmqUrl.toString()]);
    connection.on("connectFailed", (event) => {
        console.error("connectFailed", JSON.stringify(event, null, 2));
    })
    connection.on("blocked", (event) => {
        console.error("blocked", JSON.stringify(event, null, 2));
    })
    connection.on("unblocked", (event) => {
        console.error("unblocked", JSON.stringify(event, null, 2));
    })
    connection.on("disconnect", (event) => {
        console.error("disconnect", JSON.stringify(event, null, 2));
    })
    console.log(connection);
    channelWrapper = connection.createChannel({
        json: true,
        setup: async (channel) => {
            await Promise.all([channel.assertExchange(exchange, "direct")]);
        },
    });
    console.log('debug 1');

    await channelWrapper.waitForConnect();
    process.on('SIGINT', closeConnections)
    process.on('SIGTERM', closeConnections)

    app.listen(port, () => {
        console.log(`Receipt-Service listening on port ${port}`)
    })
})();

function closeConnections () {
    console.log("stopping message queue connection");
    channelWrapper.close();
    connection.close();
    // stop express
    console.log('end process: stop express');
    process.exit();
}