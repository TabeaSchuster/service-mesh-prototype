#!/usr/bin/env node

const jsonwebtoken = require("jsonwebtoken");

const token = process.argv[2];

console.log( // would be different keys in production for service than for service-desk-users
    jsonwebtoken.verify(token, process.env.SERVICE_DESK_PUBLIC_KEY_PEM, {
        algorithms: ["RS256"],
    })
);
