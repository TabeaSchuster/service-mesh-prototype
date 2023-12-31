package application_token

# formats the private key from PEM to required format
application_private_key := crypto.x509.parse_rsa_private_key(base64.decode("LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRRExiajlTZDE3SndPSGwKN28wZEVJQmFxbGN1eGc0TXV3RXF6RitsZG9pbDlIakY0WURUdFhQN0lwVUFtMHlqK0MraGo5QzQvdkhzalJhUgpNb0MvZlhWNHVmcDAvc3htdHVwRnQ0YlQ0L2JvU25rTVhhR0hvRkxiY1JDU2paMmVaaTlwZi9EVEFYQ0QrejNXCnpTQkZXRXB2djlZeTBnaTNoRVZNNDZMbzl1T1JOMEE0UFVpWlFHVXVOaDNtZG14bFdqUjFoak5pclZMakFiMTMKMXpqYXZScVo3dlhkNlB2S3pkTnJiYVN6RThSRkdDLzNEV0pkbEE1cUtKRGI5b0dIWnZIT0FaaVJlWC9UMWFyKworekRwL2czQ2tEK2xiYUJlS2xjUmtwYzdZK05sWk1rOFBzZzRXNDIwc2grOENyQ2VQV0pISytWekdHRkd3WFRtCm1TRXFLMTVyQWdNQkFBRUNnZ0VBQkZSamh2V2hHcW5VYjZpSG1xdVd2UmRDQlczK3I0NVlCSVFCWEhhczRESUIKL2dnc3plb0o2V1EvaCs5R09Ya3NubGpVRXVrNDEwQXd6NW41RVMrYzRwc1JZR1cvT1BKc3JiRFlidkJtVHJtdAp0akhVb0hFczdQRzNtTDdvaGc0R1gvaEg5UWhqVDM1M1B2ZnlWMkluMTJxeS9EV1VnajlrOERGL2JxRGo1VnZJCnpEcHlvU0dlTkhTVi9rSlNSSWNRcmUrd21SdFlXOE1YREU5YUVEZVdnNzg2SVNyRVJVOVdldjFqN2xnVFhSenYKaVMvOTI3eU00VXpQR1I5VTB1OU1KL1l3Nmc5c0tHS1BxRUpROXhvZVQvR2pvVXRFdHJUSS9Wb2lrM0t6ZU4zZApQT1ptZkp4dmh3Q1grdm51NzljTXhpV01icWpMcUhYTDhiWWw4dTVUSVFLQmdRRG5pY0xLZUVMRXhiVmplNXhFCnlqVURHRnVyNTRqZmdoQ2djTGxvNFlucTFiamJIanJyUnVvOVZrVElZREd6R0gwUWw0Y2Y5aFdRcHJ4MFRGNnMKWUV1OVI0TjlHbkpkTlZpcklXZ3pIRE40NVJJekRPdzlOdU9PL0tjbExWeUhUUjdPTVFuVWpRaE8rblpta2J6VwpSZVhjQnRZcUV4QlpwTk4zK1ZSQVdYblQ0UUtCZ1FEZzdFalhsbUIxbWNKU0UyNlpQZGxEYVVYV3hrOW5kYmltCmM4bUlPcmw5eEsvZkptckhxeVU5QWlCWFA3UFc1ZVBsc0t3VzlOenR6dHZIeDlRcUJPcDluY1N5OVFZT0lSQS8KWHZDMHJpMXVPRUpUWkIvOWdyVWNhOVM3SmI3ZzFzZ1dYMXpVaHdlNXpIa0c2T3VsdGxnMUFGQmRSb29ZOWRBdQpZMHViNGl1N3l3S0JnQ0JxS2VvY2tnUm9SVytyQTRLaDZIQUpmZlFBRXlwdlZCS1NGWEw0ZUUxM0pFMFEyMkRLCjZjb3loS2lreHZCeTBqZDdiMEJyUERPbkZDVVg5LzBiOGg2S24zN3BMKythbzFJNStCT0h0REVOcU5HYTBvdnoKWGtKTFhyOFdyYWlIaEhPTGEvdmt6cS8zNHBHVGY2TmozNzFBKzhTaUxKelFOWWJMVWg4OEo1RWhBb0dCQU1FMApWbEhSMjJQSlF6RkxmZHBtVlVWaG5Wc2pGN3dRVkIrdklETkQ5bWdCVnUxQlM4SGQwbXY0Y3AxZm0vU0JudVNECmdSOXJFSWU2QS9JMVJac2VnK3FKWmhndS94ZU44UzN1T0tlTFluem1HSnNYUzU5dzhtL0tkSDZacXIvcDN3L1EKdEtYZW81VkcvY01ndXFLcTRsUU13L3VMaHo1dmtIYjRWazg5MVVGSEFvR0FZRTZ5Q3I5a1RQWlZ3UTVQV0p6UQpuU3pvV1BUV0t1UG1KOHNsUHYzMDZYaU8wMkV5Ylk3djdOS1VvTzlmTDZIWFRqTmg4QmxTOE1Ya3JSTjlLQkZiCmJLT2luOHpGVElaOWtIV3NKZzRHMk43TUpOa1hLRTNMZVNaUDljaW1RcVFyQlUzbUx6S0oxNytaU3MrOEdDZ20KMjgvaWJNZm1FK0swSGJuMTBiR2V2b289Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0KCg=="))
# opa.runtime().env.APPLICATION_PRIVATE_KEY_PEM)

# loads the public key in PEM format
application_public_key := base64.decode("LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUF5MjQvVW5kZXljRGg1ZTZOSFJDQQpXcXBYTHNZT0RMc0JLc3hmcFhhSXBmUjR4ZUdBMDdWeit5S1ZBSnRNby9ndm9ZL1F1UDd4N0kwV2tUS0F2MzExCmVMbjZkUDdNWnJicVJiZUcwK1AyNkVwNURGMmhoNkJTMjNFUWtvMmRubVl2YVgvdzB3RndnL3M5MXMwZ1JWaEsKYjcvV010SUl0NFJGVE9PaTZQYmprVGRBT0QxSW1VQmxMallkNW5ac1pWbzBkWVl6WXExUzR3RzlkOWM0MnIwYQptZTcxM2VqN3lzM1RhMjJrc3hQRVJSZ3Y5dzFpWFpRT2FpaVEyL2FCaDJieHpnR1lrWGwvMDlXcS92c3c2ZjROCndwQS9wVzJnWGlwWEVaS1hPMlBqWldUSlBEN0lPRnVOdExJZnZBcXduajFpUnl2bGN4aGhSc0YwNXBraEtpdGUKYXdJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==")
# application_public_key :=  opa.runtime().env.APPLICATION_PUBLIC_KEY_PEM


# creates a signed application token
create_token(payload) := io.jwt.encode_sign(
  { "typ": "JWT", "alg": "RS256" },
  object.union({
    "iat": _now_s,
    "exp": _now_s + 60 * 60 * 4, # use shorter period in production,
    "iss": "application", #bonus-application-jwt-issuer,
    "sub": "application"
  }, payload),
  application_private_key
)

# verifies the token signature against the public key of the application
token_has_valid_signature(token) := io.jwt.verify_rs256(token, application_public_key)


# utility rules for the current time
_now_s = floor(_now_ns / 1000 / 1000 / 1000)
_now_ns = return {
  return := time.now_ns()
}
