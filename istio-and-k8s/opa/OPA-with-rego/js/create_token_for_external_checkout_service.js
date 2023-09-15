#!/usr/bin/env node

const jsonwebtoken = require("jsonwebtoken");

const now = Math.floor(Date.now() / 1000);

const token = jsonwebtoken.sign(
    {
        serviceName: "external-checkout-service",
        iat: now,
        exp: now + 24 * 60 * 60 * 10,  // use shorter period in production,
        iss: "external-checkout-service",
        sub: "external-checkout-service"
    },
    process.env.SERVICE_DESK_PRIVATE_KEY_PEM, // would be different keys in production for service than for service-desk-users
    { algorithm: "RS256" }
);

console.log(token);
