# Prototypical implementation of a service mesh using a representative example from a project by the company Open Reply  
## Setup of project and Service-Mesh


This file contains the steps and terminal commands needed to set up the project and deploy the Istio resources.

A postman collection with example requests for the endpoints can be found at:
https://elements.getpostman.com/redirect?entityId=22543002-6a71a512-c7a9-4952-ab3b-a3a740927360&entityType=collection

## Installation of docker, istio and minikube etc.

Ubuntu 22.04 LTS was used to run the prototype and ssh tunnels where used to connect to a local Mac Ventura 13.2.1. <br>
Client Postman was used on the Mac to send requests to the machine and ssh tunnels where used to display Kiali, Grafana and Jaeger Dashboards on the Mac.<br>
The commandline tool rsync was used to sync files.<br>

Install docker, minikube, istio, node.js and curl on your system.<br>
For the thesis Docker Version 20.10.21, Minikube Version v1.30.1, Istio Version 1.17.2 und Node.js Version v12.22.9. was used. <br>
For minikube cluster was created with docker as driver, 2 CPUs and 4000MB Storage


## Mongo-DB
Start Mongo-DB as docker-container and insert some data into the db

```
sudo docker run -d -p 27017:27017 --name bonus-booklet-mongo \
-e MONGO_INITDB_ROOT_USERNAME=mongoadmin \
-e MONGO_INITDB_ROOT_PASSWORD=secret \
-v /home/ubuntu/mongodb:/data/db \
mongo:latest
```
[... todo]
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
```
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
```
minikube  docker-env
eval $(minikube -p minikube docker-env)
```

Go into the directory where the service code and docker images are located. <br>
Build the docker images.
```
cd ../service-mesh-prototype/services-and-docker
docker build -f docker/coupon-service.Dockerfile -t tabeaschuster/coupon-service .
docker build -f docker/bonus-booklet-service.Dockerfile -t tabeaschuster/bonus-booklet-service .
docker build -f docker/receipt-service.Dockerfile -t tabeaschuster/receipt-service .
docker build -f docker/user-service.Dockerfile -t tabeaschuster/user-service .
docker build -f docker/benefit-service.Dockerfile -t tabeaschuster/benefit-service .
```







###

### JWT 
create jwt
 ``` 
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

Use the token as authentication-bearer-token in your request, e.g. by using postman or curl
Create application token with: node create_application_token.js employee-1 
Create token for external checkout-service with: node create_token_for_external_checkout_service.js


