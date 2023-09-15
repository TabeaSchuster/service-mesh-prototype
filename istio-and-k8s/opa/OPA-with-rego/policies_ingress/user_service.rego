package user_service

#host_ingressgateway := opa.runtime().env.ISTIO_INGRESSGATEWAY_SERVICE_HOST
#port_ingressgateway := opa.runtime().env.ISTIO_INGRESSGATEWAY_SERVICE_PORT_HTTP2
#base_url := concat("", ["http://", host_ingressgateway, ":", port_ingressgateway])

host_name_user_service := opa.runtime().env.USER_SERVICE_SERVICE_HOST
port_number_user_service := opa.runtime().env.USER_SERVICE_SERVICE_PORT_HTTP
user_service_url := concat("", ["http://", host_name_user_service, ":", port_number_user_service])


get_user_by_external_id(id) = parsed_body { # not service-desk-token, but external employee-id as "648329-893" for "employee-1"
 print("debug u1")
 print("url")
 print(concat("", [user_service_url, "/users/users-by-external-service-desk-id/", id]))
  response := http.send({
    "method": "GET",
    "url": concat("", [user_service_url, "/users/users-by-external-service-desk-id/", id]), # id = external-id: "648329-893"
    "timeout": "500ms",
    # if needed, you can also pass headers:
    # "headers": {
    #   "Authorization": "Bearer ..."
    # }, # x-
  })
   print("debug u2")
  response.status_code == 200
   print("debug u3")
  parsed_body := json.unmarshal(response.raw_body)
   print("debug u4")
}

get_user_by_id(id) = parsed_body {
print("debug u5")
  response := http.send({
    "method": "GET",
    "url": concat("", [user_service_url, "/users/", id]),
    "timeout": "500ms",
  })
   print("debug u6")
  response.status_code == 200
   print("debug u7")
  parsed_body := json.unmarshal(response.raw_body)
   print("debug u8")
}
