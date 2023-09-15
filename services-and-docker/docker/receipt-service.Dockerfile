FROM node:latest
WORKDIR /usr/src/app
COPY receipt-service/src ./src
COPY receipt-service/package.json ./
RUN npm install
EXPOSE 3003
CMD [ "node", "src/index.js" ]