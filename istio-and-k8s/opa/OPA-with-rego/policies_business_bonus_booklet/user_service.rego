package user_service

host_name_user_service := opa.runtime().env.USER_SERVICE_SERVICE_HOST
port_number_user_service := opa.runtime().env.USER_SERVICE_SERVICE_PORT_HTTP
user_service_url := concat("", ["http://", host_name_user_service, ":", port_number_user_service])

# GET /users/{{userId}}
get_user_by_id(userId) = parsed_body {
  # true, if response of user-service is 200 and returns valid user
  print("debug 13, service opa,call user service ")
  response := http.send({
    "method": "GET",
    "url": concat("", [user_service_url, "/users/", userId]),
    "timeout": "500ms",
  })
  print("debug 13, service opa,call user service ")
  print(response)
  response.status_code == 200
  print("debug 13, service opa,call user service ")
  parsed_body := json.unmarshal(response.raw_body)
  print("debug 13, service opa,call user service ")
}
