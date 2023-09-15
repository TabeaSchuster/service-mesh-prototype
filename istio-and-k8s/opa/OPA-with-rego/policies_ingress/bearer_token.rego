package bearer_token

import input.attributes.request.http as request

# If the `Authorization` header starts with `Bearer `, this contains the token
token = _token {
  [_type, _token] := split(request.headers.authorization, " ")
  _type == "Bearer"
}


# If the `Authorization` header starts with `Bearer `, this contains the token's payload
payload = _payload {
  [_, _payload, _] := io.jwt.decode(token)
}
