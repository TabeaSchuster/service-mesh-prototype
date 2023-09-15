#!/usr/bin/env node

const jsonwebtoken = require("jsonwebtoken");

const now = Math.floor(Date.now() / 1000);

const token = jsonwebtoken.sign(
    {
        employeeId: process.argv[2] ?? "648329-893",
        iat: now,
        exp: now + 24 * 60 * 60,  // use shorter period in production,
        iss: "service-desk-jwt-issuer",
        sub: "service-desk-jwt-issuer"
    },
    process.env.SERVICE_DESK_PRIVATE_KEY_PEM,
    { algorithm: "RS256" }
);

console.log(token);
