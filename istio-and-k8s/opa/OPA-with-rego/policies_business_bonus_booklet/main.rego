package envoy.authz

import data.application_token
import data.bearer_token
import data.user_service

default allow := false

allow {
# endpoint redeem benefit (for employee or regular users; create coupon for themselves from collected points)
# POST /bonus-booklets/:bonusBookletId/benefits?userId={{myUserId}}
  print("debug 1, service opa")
  # allow if it has a valid internal application token
  application_token.token_has_valid_signature(bearer_token.token)
  print("debug 2, service opa")
  # request is to a specific endpoint
  input.attributes.request.http.method == "POST"
  ["bonus-booklets", _, "benefits"] = input.parsed_path
  # users can only redeem benefits for themselves
  print("debug 3, service opa")
  input.parsed_query.userId[0] == bearer_token.payload.userId
  print("debug 4, service opa")
}


allow  = response_to_envoy {
# endpoint to create manual transaction, only employee can do it for user from the same store as them
# POST /bonus-booklets/{{bonusBookletId}}/transactions?userId=user-1
 print("debug 5, service opa")
  # allow if it has a valid internal application token
  application_token.token_has_valid_signature(bearer_token.token)
print("debug 6, service opa")
  # request is to a specific endpoint
  input.attributes.request.http.method == "POST"
  ["bonus-booklets", _, "transactions"] = input.parsed_path
print("debug 7, service opa")
  # employee and user have to exist, emloyee has to be of type employee
  _employee := user_service.get_user_by_id(bearer_token.payload.userId)
  print("debug 8, service opa")
  _user := user_service.get_user_by_id(input.parsed_query.userId[0])
  print("debug 9, service opa")
  _employee.isEmployee
  print("debug 10, service opa")

  # both application user and employee have to belong to the same store
  # because employee can only create manual transcation (add points) for a customer from it's store
  _user.storeId == _employee.storeId
  print("debug 111, service opa")

  response_to_envoy := {
      "allowed": true
  }
  print("debug 12, service opa")
}
