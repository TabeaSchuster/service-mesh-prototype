# start this service outside of the mesh
# with parameters:
# docker run -p 127.0.0.1:3005:3005  --name checkout-service  -e RECEIPT_SERVICE_SERVICE_HOST="http://$GATEWAY_URL/bonus-app/receipts" -e RECEIPT_SERVICE_SERVICE_PORT_HTTP="80" tabeaschuster/checkout-service
#
FROM node:latest
WORKDIR /usr/src/app
COPY checkout-service/src ./src
COPY checkout-service/package.json ./
RUN npm install
EXPOSE 3005
CMD [ "node", "src/index.js" ]