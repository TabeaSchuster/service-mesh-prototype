const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config(); // get config vars
const app = express()
const port = 3002
app.use(bodyParser.json())


let prefix = "/users";

// "Database" simplified for prototype
const users = [
    {id: "user-1", storeId: "store1", isEmployee: false, address: "Konsul-Smidt-Straße 14, 28217 Bremen"},
    {id: "user-2", storeId: "store2", isEmployee: false, address: "Werrastraße 3, 26135 Oldenburg"},
    {id: "user-3", storeId: "store1", isEmployee: false, address: "Konsul-Smidt-Straße 14, 28217 Bremen"},
    {id: "employee-1", externalIdServiceDesk: "648329-893", storeId: "store1", isEmployee: true, address: "Flughafenallee 10, 28199 Bremen"},
    {id: "employee-2", externalIdServiceDesk: "648329-894", storeId: "store2", isEmployee: true, address: "Werrastraße 3, 26135 Oldenburg"},
];

//  #   {external-id: "648329-893", id: "employee-1", storeId: "store1", isEmployee: true, address: "Flughafenallee 10, 28199 Bremen"},
//  #   {external-id: "648329-893", id: "employee-2", storeId: "store2", isEmployee: true, address: "Werrastraße 3, 26135 Oldenburg"},

const superSafeCredetials = [
    {id: "user-1", pass: "greatPw"},
    {id: "user-2", pass: "greatPw2"},
    {id: "user-3", pass: "greatPw3"},
    {id: "employee-1", pass: "greatPw5"},
    {id: "employee-2", pass: "greatPw6"},
]


app.get( prefix + '/health', (req, res) => {
    res.send('User-Service is healthy')
})


app.post(prefix + '/login', async (req, res) => {
    let userId = req.body.userId;
    let password = req.body.password;

    let userCredential = superSafeCredetials.find(user => user.id === userId);
    if (userCredential && userCredential.pass === password) {

        // jwt.sign({userId : userId}, process.env.TOKEN_SECRET, { expiresIn: '1800s' }, function(err, token) {
        //     if (err) {
        //         res.send(JSON.stringify({ "message": 'login failed during token generation', "error": err }) );
        //     } else {
        //         res.send(JSON.stringify({ "message": "login successful", "access_token": token} ));
        //     }
        // });

        const now = Math.floor(Date.now() / 1000);

        jwt.sign(
            {
                userId: userId ?? 'user-1',
                iat: now,
                exp: now + 24 * 60 * 60, // use shorter period in production,
                iss: "application", // bonus-application-jwt-issuer,
                sub: "application",
                groups: [
                    "benefitGroupLoyaltyPlus",
                    "group2"
                ],
            },
            process.env.APPLICATION_PRIVATE_KEY_PEM,
            { algorithm: "RS256" },
            function(err, token) {
                if (err) {
                    res.send(JSON.stringify({ "message": 'login failed during token generation', "error": err }) );
                } else {
                    res.send(JSON.stringify({ "message": "login successful", "access_token": token} ));
                }
            }
        );


    } else {
        res.send('login failed: user or password invalid');
    }
})

app.get(prefix + '/me/', authenticateToken, (req, res) => {
    let userId = req.userJWT.userId;
    let user = users.find(obj => obj.id === userId);

    if(!user) {
        res.writeHead(404, {'Content-type': 'application/json'})
        return res.end('User not found with userId ' + userId);
    }
    res.writeHead(200, {'Content-type': 'application/json'})
    return res.end(JSON.stringify(user));
})


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    // jwt.verify(token, process.env.TOKEN_SECRET, (err, userJWT) => {
    //     if (err) {
    //         console.log(err);
    //         return res.sendStatus(403);
    //     }
    //     req.userJWT = userJWT;
    //     next();
    // })
    jwt.verify(token, process.env.APPLICATION_PUBLIC_KEY_PEM, {
            algorithms: ["RS256"],
        },
        (err, userJWT) => {
            if (err) {
                console.log(err);
                return res.sendStatus(403);
            }
            req.userJWT = userJWT;
            next();
        }
    )
}


app.patch(prefix + '/me/', authenticateToken, (req, res) => {
    let userId = req.userJWT.userId;
    let user = users.find(obj => obj.id === userId);

    if(!user) {
        res.writeHead(404, {'Content-type': 'application/json'});

        return res.end(JSON.stringify({"message":'User not found with userId ' + userId }));
    }

    // to shorten prototype: skip data validation etc. and other data than address
    user.address  = req.body.address;
    res.writeHead(200, {'Content-type': 'application/json'});
    return res.end(JSON.stringify({"message": "Successfully changed user data", "user": user}) );
})

app.get(prefix + '/:userId/', (req, res) => {
    let userId = req.params.userId;

    const user = users.find(obj => obj.id === userId);

    if(!user) {
        res.writeHead(404, {'Content-type': 'application/json'});
        return res.end(JSON.stringify({"message":'User not found with userId ' + userId }));
    }
    res.writeHead(200, {'Content-type': 'application/json'});
    return res.end(JSON.stringify(user));
})

app.get(prefix + "/users-by-external-service-desk-id/:externalIdServiceDesk", (req, res) => {
    console.log("hello from users-by-external-service-desk-id");
    const user = users.find(
        (user) => user.externalIdServiceDesk == req.params.externalIdServiceDesk
    );
    if (!user) {
        return res.status(404).send('External user not found');
    }
    return res.status(200).json(user);
});

app.listen(port, () => {
    console.log(`User-Service listening on port ${port}`)
})