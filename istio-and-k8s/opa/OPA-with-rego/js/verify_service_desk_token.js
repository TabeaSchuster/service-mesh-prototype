#!/usr/bin/env node

const jsonwebtoken = require("jsonwebtoken");

const token = process.argv[2];

console.log(
    jsonwebtoken.verify(token, process.env.SERVICE_DESK_PUBLIC_KEY_PEM, {
        algorithms: ["RS256"],
    })
);
