# Prototypical implementation of a service mesh using a representative example from a project by the company X  
## Setup of project and Service-Mesh


This file contains the steps and terminal commands needed to set up the project and deploy the Istio resources.
The document is in English because the company's team is multilingual.

A postman collection with example requests for the endpoints can be found at:
https://elements.getpostman.com/redirect?entityId=22543002-6a71a512-c7a9-4952-ab3b-a3a740927360&entityType=collection

## Installation of docker, istio and minikube etc.

Ubuntu 22.04 LTS was used to run the prototype and ssh tunnels where used to connect to a local Mac Ventura 13.2.1. <br>
Client Postman was used on the Mac to send requests to the machine and ssh tunnels where used to display Kiali, Grafana and Jaeger Dashboards on the Mac.<br>
The commandline tool rsync was used to sync files.<br>

Install docker, minikube, istio, node.js and curl on your system.<br>
For the thesis Docker Version 20.10.21, Minikube Version v1.30.1, Istio Version 1.17.2 und Node.js Version v12.22.9. was used. <br>
For minikube cluster was created with docker as driver, 2 CPUs and 4000MB Storage<br>
The commandline tools kubectl and istioctl are used to interact with the cluster and deploy the services and istio policies into the mesh.


## Mongo-DB
Start Mongo-DB as docker-container and insert some data into the db

```
sudo docker run -d -p 27017:27017 --name bonus-booklet-mongo \
-e MONGO_INITDB_ROOT_USERNAME=mongoadmin \
-e MONGO_INITDB_ROOT_PASSWORD=secret \
-v /home/ubuntu/mongodb:/data/db \
mongo:latest
```

<details>
<summary>Add some data</summary>

```
# create collection
db.createCollection("bonusbooklet");
# create user for the service, which should use the db
use test
db.createUser(  {  user:  "bonus-booklet-service-xy123",  pwd: "bonus-CASE!behave7poesy",  roles: [ "readWrite"] } );

db.bonusbooklet.insert({ "user" : "user-1", "total-points" : 25, "transactions" : [   {   "transaction-id" : "some-uuid-1", "timestamp" :"2023-08-21T11:32:52Z",  "type" : "receipt", "points" : 25 } ]});
# you can find and show the entry with:
db.bonusbooklet.findOne({ "user" : "user-1"})
# if you need to delete it: (use its _id)
#  db.bonusbooklet.deleteOne({_id: ObjectId("64d650c12ea333c21f4607be")})
# generate some basic data: create entries for user-2, user-3, employee-1 and employee-2
db.bonusbooklet.insertMany([{ "user" : "user-2", "total-points" : 25, "transactions" : [   {   "transaction-id" : "some-uuid-1", "timestamp" :"2023-08-21T11:32:52Z",  "type" : "receipt", "points" : 25 } ]},{ "user" : "user-3", "total-points" : 25, "transactions" : [   {   "transaction-id" : "some-uuid-1", "timestamp" :"2023-08-21T11:32:52Z",  "type" : "receipt", "points" : 25 } ]},{ "user" : "employee-1", "total-points" : 25, "transactions" : [   {   "transaction-id" : "some-uuid-1", "timestamp" :"2023-08-21T11:32:52Z",  "type" : "receipt", "points" : 25 } ]},{ "user" : "employee-2", "total-points" : 25, "transactions" : [   {   "transaction-id" : "some-uuid-1", "timestamp" :"2023-08-21T11:32:52Z",  "type" : "receipt", "points" : 25 } ]}]);
# show all entries
db.bonusbooklet.find()
```
</details>


## Message-Queue Rabbit-MQ


Start rabbit-mq as docker container outside the mesh.<br>
On linux server: <br>
`sudo docker run --platform=linux/amd64 -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin -v /home/ubuntu/rabbitmq-data:/var/lib/rabbitmq -t rabbitmq:3-management` <br>
Or for mac (m1 chip): <br>
`docker run --platform=linux/arm64/v8 -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin -v /tmp/rabbitmq-data:/var/lib/rabbitmq -t rabbitmq:3-management` <br>

## Minikube
Create and start a new minikube cluster: <br>
`minikube start` <br>
Minikube cluster was created with docker as driver, 2 CPUs and 4000MB Storage

## Istio
You need to install Istio on your system first. Then install istio in the cluster by using the IstioOperator from this project.  <br>
```istioctl install -f  istio-and-k8s/IstioOperator-config.yaml -y```<br>
The operator sets certain configurations for the mesh. It activates access-logging, allows only outgoing traffic to resources in the registry and opens egress ports for communication with MongoDb and RabbitMQ.<br><br>
Activate the automatic injection of istio-sidecar-proxies for services in the default namespace.<br>
```kubectl label namespace default istio-injection=enabled```

### Install observability addons
Go into the installation directory of istio and install the preconfigured addons for the observability tools, to collect and visualize metrics, display distributed traces and show a general overview of the service mesh.
```shell
cd ../istio-1.17.2
kubectl apply -f samples/addons/prometheus.yaml
kubectl apply -f samples/addons/grafana.yaml
kubectl apply -f samples/addons/kiali.yaml
kubectl apply -f samples/addons/jaeger.yaml
```

Open dashboards for Grafana, Kiali and Jaeger like this: e.g. for Kiali:<br>
`istioctl dashboard kiali` <br>
If you use a remote server, open a tunnel similar to this: <br>
` ssh -i ~/.ssh/tschuster_ba ubuntu@3.73.99.194  -N -L 20001:localhost:20001`


## Build docker images for the mirco-services inside the mesh
The docker images of the services will be referenced in the kubernetes-ressource "deployment" to create the and deploy the pods of that services in the cluster.

Point your shell to minikube's docker-daemon (instead of the docker-daemon of your machine, where the mongo-db is running).<br>
This enables you to use the docker images inside the cluster.
```shell
minikube  docker-env
eval $(minikube -p minikube docker-env)
```

Go into the directory where the service code and docker images are located. <br>
Build the docker images.
```shell
cd ../service-mesh-prototype/services-and-docker
docker build -f docker/coupon-service.Dockerfile -t tabeaschuster/coupon-service .
docker build -f docker/bonus-booklet-service.Dockerfile -t tabeaschuster/bonus-booklet-service .
docker build -f docker/receipt-service.Dockerfile -t tabeaschuster/receipt-service .
docker build -f docker/user-service.Dockerfile -t tabeaschuster/user-service .
docker build -f docker/benefit-service.Dockerfile -t tabeaschuster/benefit-service .
```

## Deploy Services and Ingress-Gateway into the mesh

The commandline tool kubectl is used to deploy the istio and kubernetes resources which are defined in the declarative .yaml files <br>
Use e.g. "kubectl apply -f my-service.yaml" with a service-deployment to deploy the service. To delete it you can use "kubectl delete -f my-service.yaml". <br>

Deploy the ingress-gateway and the internal services with:
```shell
kubectl apply -f istio-and-k8s/ingress-gateway-and-services.yaml
kubectl apply -f istio-and-k8s/bonus-booklet-without-opa.yaml
```

The first one will create the ingress-gateway which open the port 80 for incoming traffic and route the traffic towards the services, by matching the routes defined in its virtual service. <br>
It also contains and deploys the services coupon-service, benefit-service, user-service and receipt-service by using their resources service and deployment and the service-account for their identity. <br>
<br> <br>
The second one deploys the bonus-booklet (deployment, service, service account), for now without opa-sidecar-container. That one will be deployt later.

## Open a tunnel for the ingress-gateway
Open a tunnel from the minikube cluster to the host system. Do it in another console tab.
` minikube tunnel` 
Go back to the original tab and export the URL and PORT of the Ingress-Gateway.
```shell
export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')
export SECURE_INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="https")].port}')
export GATEWAY_URL=$INGRESS_HOST:$INGRESS_PORT
echo $GATEWAY_URL
```
Test the connection by calling the health endpoint of the user-service
`curl --location --request GET "http://$GATEWAY_URL/users/health"`

For the thesis, an ssh-tunnel was opened for the connection between the mac and the ubuntu system.<br>
After that postman was used to call the services.

## Deploy Egress-Gateway into the mesh

Next, the egress-gateway configuration will be deployt, which will allow the connection to the mongo-db database and rabbit-mq message queue. These were already started as docker containers outside the mesh. <br>
The mesh config was set to "REGISTRY ONLY" with the Isto-Operator to allow only outgoing traffic to known destinations, which are registered in istios service-registry.<br>
Therefore, a Service-Entry is created for both, the mongo-db and the rabbit-mq.<br><br>
The egress.yaml will define and allow the routing to mongo-db and rabbit-mq:<br>
To enable the routing to them, there need to be multiple destination rules and virtual services. <br>
At the moment, tcp is used for this connection. Two ports were open with the Isto-Operator for this and the egress-gateway will perform the routing to those with the virtual-service and the destination rule.
In the future, this connection should be changed to a tls connection.
<br><br>
In egress.yaml, in the virtual services you need to adjust the  destinationSubnets to the ip of mongo and rabbitmq (e.g.  192.168.49.1 )
Also adjust the same ip in rabbitmq_service_entry.yaml and in mongo_service_entry.yaml for spec.addresses and spec.endpoints.address.

```shell
kubectl apply -f istio-and-k8s/egress/mongo_service_entry.yaml
kubectl apply -f istio-and-k8s/egress/rabbitmq_service_entry.yaml
kubectl apply -f istio-and-k8s/egress/egress.yaml
```

## JWT 
Create jwt 
 ```shell
 cd istio-and-k8s/opa/OPA-with-rego/js
# export env to console
 source ../.env 
 # e.g. create service-desk token,
 # same procedure for application-token and token for external checkout-service
 # you can provide optional id as parameter for employee / user id
 node create_service_desk_token.js 648329-893
 # you can verify ist with
  node verify_service_desk_token.js <your-token>
 ```

Use the token as authentication-bearer-token in your request, e.g. by using postman or curl.<br>
Create application token with: `node create_application_token.js employee-1` <br>
Create token for external checkout-service with: `node create_token_for_external_checkout_service.js` <br>

## Authorization-Policies

Apply the authorization policies with:
First deny all traffic.
``` kubectl apply -f istio-and-k8s/authorization-policies/deny-all-policy.yaml``` 
Then allow specific traffic
```shell
# for the ingress-gateway
kubectl apply -f istio-and-k8s/authorization-policies/ingress-policy.yaml
# for the services
kubectl apply -f istio-and-k8s/authorization-policies/service-policies/benefit-service-policy.yaml
kubectl apply -f istio-and-k8s/authorization-policies/service-policies/bonus-booklet-service-policy.yaml
kubectl apply -f istio-and-k8s/authorization-policies/service-policies/coupon-service-policy.yaml
kubectl apply -f istio-and-k8s/authorization-policies/service-policies/receipt-service-policy.yaml
kubectl apply -f istio-and-k8s/authorization-policies/service-policies/user-service-policy.yaml
``` 

## RequestAuthentication for JWT
Some authorization-policies allow requests, when a certain JWT is used for authentication.<br>
The authentication for these are registered and validated with the RequestAuthentication-Ressource.<br>
```
kubectl apply -f use-k8s/RequestAuthetication.yaml
```


## OPA
### Depoly OPAs
Two OPAs will be used, one at the ingress-gateway, one at the bonus-booklet-service (service-opa).<br>
The ingress-opa is itself a service with deployment, service and service-account<br>
The service-opa is a sidecar-container running in the pod of the bonus-booklet-service. <br>
It is defined as a container in the bonus-booklet-deployment and has a service-entry.<br>
The external OPA-Policy-Rules in OPAs language rego will be stored in a configmap for each OPA.
<br><br>
First delete the previous bonus-booklet-servcie:
` kubectl delete -f istio-and-k8s/bonus-booklet-without-opa.yaml `
```shell
# create configmap
cd istio-and-k8s/opa/OPA-with-rego/policies_business_bonus_booklet
kubectl  create configmap opa-policy  --from-file main.rego --from-file application_token.rego --from-file bearer_token.rego --from-file user_service.rego && cd ../../../../
# bonus-booklet-deployment with service entry etc for opa sidecar container
  kubectl apply -f istio-and-k8s/bonus-booklet-with-opa.yaml 
 
```
Create authorization policy with CUSTOM action to use OPA as external authenticator:
` kubectl apply -f istio-and-k8s/opa/istio-policy-bonus-booklet-service/authz-policy-opa-bonusbooklet.yaml`

Deploy OPA-Ingress in default namespace mit istio-proxy

```shell
# create configmap
cd istio-and-k8s/opa/OPA-with-rego/policies_ingress
kubectl  create configmap opa-ingress-policy --from-file main.rego  --from-file application_token.rego --from-file bearer_token.rego --from-file user_service.rego --from-file service_desk_token.rego && cd ../../../../
# opa service and deployment 
kubectl apply -f opa-auth/ingress/ingress-opa.yaml 
# authz policy with CUSTOM action to use OPA  as external authenticator:
kubectl apply -f opa-auth/ingress/ingress-opa-authz.yaml
# allow-policy for opas istio-proxy
kubectl apply -f authorization-policies/opa-ingress-authz-allow-policy.yaml 
```

### Add the extensionProviders to the meshconfig
The OPAs need to be added as extensionProviders to the mesh-config:
```shell
kubectl edit configmap istio -n istio-system
```
Add to the config:
```shell
extensionProviders:
- name: "opa.default"
envoyExtAuthzGrpc:
service: "opa.default.svc.cluster.local"
port: "9191"
- name: "opa.local"
envoyExtAuthzGrpc:
service: "local-opa-grpc.local"
port: "9191"
```

You can get the logs with
```shell
# ingress gateway
kubectl logs -n istio-system "$( kubectl get pod -l app=istio-ingressgateway -n istio-system  -o jsonpath='{.items[0].metadata.name}')" -f
# opa-ingress: logs of istio-container  and opa container itself
kubectl logs "$( kubectl get pod -l app=opa -o jsonpath='{.items[0].metadata.name}')" -c istio-proxy -f
kubectl logs "$( kubectl get pod -l app=opa -o jsonpath='{.items[0].metadata.name}')" -c opa  -f
# logs of opa-container of bonus-booklet
kubectl logs "$( kubectl get pod -l app=bonus-booklet-service -o jsonpath='{.items[0].metadata.name}')"  -c opa -f
# logs of istio-proxy of user-service
kubectl logs "$( kubectl get pod -l app=user-service -o jsonpath='{.items[0].metadata.name}')" -c istio-proxy -f
# logs og egress gateway
kubectl logs -n istio-system "$( kubectl get pod -l app=istio-egressgateway -n istio-system  -o jsonpath='{.items[0].metadata.name}')" -f
```

##  Run checkout service outside the mesh as node app
Install nodejs e.g. version v12.22.9. Run checkout service outside the mesh as node app:
```shell 
cd services-and-docker/checkout-service/src/index.js
node src/index.js
``` 

## mTLS by using PeerAuthentications
### Use mTLS STRICT mode for whole cluster:
` istio-and-k8s/mTLS/namespace-peer-authentication-mtls.yaml `<br>

### Use mTLS permissive mode for the receipt service: 
Create another namespace with name "older-services", do not enable automatic sidecar-injection.<br>
Deploy service benefit-older.yaml there, it will have no sidecar.<br>
` kubectl apply -f benefit-older.yaml`<br>
Therefore the communication will be in cleartext, no mTLS activated.<br>
Call service from other namespace with pattern: service-name.namespace-name:PORT/endpoint-name, e.g. receipt-service.default:3003/receipts/health
```shell
kubectl exec --stdin --tty "$( kubectl get pod -l app=old-benefit-service -n older-services -o jsonpath='{.items[0].metadata.name}')"  -n older-services -- /bin/bash
curl -v receipt-service.default:3003/receipts/health
```
It will be denied while meshwide PeerAuthentication to set mTLS to strict (default is permissive).<br>
Apply PeerAuthentication with PERMISSIVE mode for receipt-service. <br>
This service will now also accept cleartext communication from other services, which is needed for migration.
```shell
kubectl apply -f istio-and-k8s/mTLS/receipt-peer-authentication.yaml
```
Now you can repeat the call, it will be allowed.
