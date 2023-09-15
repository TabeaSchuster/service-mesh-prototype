package envoy.authz

import data.application_token
import data.bearer_token
import data.service_desk_token
import data.user_service

default allow := false

# Ingress-OPA: Token-Exchange

allow {
print("debug 1")
  # allow directly, if internal application-token is used (can be user or employee)
  application_token.token_has_valid_signature(bearer_token.token)
  print("debug 2")
}
else = false {   # do not allow this case:
  # valid external service-desk-token, but not a user of this
  # application, is not an employee or user in the user-db
  print("debug 3")
  service_desk_token.token_has_valid_signature(bearer_token.token)
  print("debug 4")
  print("debug 4.1 user_service.get_user_by_external_id(bearer_token.payload.employeeId)")
  print(user_service.get_user_by_external_id(bearer_token.payload.employeeId))
  not user_service.get_user_by_external_id(bearer_token.payload.employeeId)
  print("debug 5")
} else = response_to_envoy {
  # exchange service_desk token to application token
   print("debug 6")
  # if external token is valid and employee exists in applications internal user-db
  service_desk_token.token_has_valid_signature(bearer_token.token)
  print("debug 7")
  print("bearer_token.payload.employeeId")
  print(bearer_token.payload.employeeId)
  _employee := user_service.get_user_by_external_id(bearer_token.payload.employeeId)
print("debug 8")
  # set the Authorization header for the upstream service to use an internal application token
  response_to_envoy := {
    "allowed": true,
    "headers": {
      "Authorization": concat(" ", ["Bearer", application_token.create_token({
        "userId": _employee.id, # the employees internal id (e.g. employee-2)
      })])
    }
  }
  print("debug 9")
}
