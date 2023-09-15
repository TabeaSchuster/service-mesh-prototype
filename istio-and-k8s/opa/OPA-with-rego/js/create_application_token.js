#!/usr/bin/env node

const jsonwebtoken = require("jsonwebtoken");

const now = Math.floor(Date.now() / 1000);

const token = jsonwebtoken.sign(
    {
        userId: process.argv[2] ?? 'user-1',
        iat: now,
        exp: now + 24 * 60 * 60, // use shorter period in production,
        iss: "application",
        sub: "application",
        groups: [
            "benefitGroupLoyaltyPlus",
            "group2"
        ],
    },
    process.env.APPLICATION_PRIVATE_KEY_PEM,
    { algorithm: "RS256" }
);

console.log(token);
