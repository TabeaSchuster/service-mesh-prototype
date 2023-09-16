## Prototypische Umsetzung eines Service-Meshes anhand eines repräsentativen  Ausschnittes eines Projektes für Open Reply
## Prototypical implementation of a service mesh using a representative example from a project by the company Open Reply  
## Setup of project and Service-Mesh

# TODO
- services-and-docker/bonus-booklet-service/src/mongodb-openssl --> kann das weg?

# END_TODO


This file contains the steps and terminal commands needed to set up the project and deploy the Istio resources.

# Installation of docker, istio and minikube

[... todo]

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


### start rabbit-mq as docker container outside of the mesh
### auf linux server, sudo
sudo docker run --platform=linux/amd64 -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin -v /home/ubuntu/rabbitmq-data:/var/lib/rabbitmq -t rabbitmq:3-management
### oder auf mac mit m1 chip
### docker run --platform=linux/arm64/v8 -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin -v /tmp/rabbitmq-data:/var/lib/rabbitmq -t rabbitmq:3-management

### todo install minikube
minikube start
### todo: install istio
istioctl install -f  use-k8s/IstioOperator-config.yaml -y
kubectl label namespace default istio-injection=enabled

cd ../istio-1.17.2
kubectl apply -f samples/addons/prometheus.yaml
kubectl apply -f samples/addons/grafana.yaml
kubectl apply -f samples/addons/kiali.yaml
kubectl apply -f samples/addons/jaeger.yaml
### open dashboards for grafana, kiali and jaeger like this: e.g.
istioctl dashboard kiali
### if you use a remot server, open a tunnel similar to this:
### ssh -i ~/.ssh/tschuster_ba ubuntu@3.73.99.194  -N -L 20001:localhost:20001

# Point your shell to minikube's docker-daemon 
# (instead of the docker-daemon of your machine, where the mongo-db is running)
# Enables you to use the docker images inside the cluster
minikube  docker-env
eval $(minikube -p minikube docker-env)


# build docker images
cd ../ba-prototype/services-and-docker
docker build -f docker/coupon-service.Dockerfile -t tabeaschuster/coupon-service .
docker build -f docker/bonus-booklet-service.Dockerfile -t tabeaschuster/bonus-booklet-service .
docker build -f docker/receipt-service.Dockerfile -t tabeaschuster/receipt-service .
docker build -f docker/user-service.Dockerfile -t tabeaschuster/user-service .
docker build -f docker/benefit-service.Dockerfile -t tabeaschuster/benefit-service .







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


