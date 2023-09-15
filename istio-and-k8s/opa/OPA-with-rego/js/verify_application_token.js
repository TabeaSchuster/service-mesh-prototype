#!/usr/bin/env node

const jsonwebtoken = require("jsonwebtoken");

const token = process.argv[2];

console.log(
    jsonwebtoken.verify(token, process.env.APPLICATION_PUBLIC_KEY_PEM, {
        algorithms: ["RS256"],
    })
);
