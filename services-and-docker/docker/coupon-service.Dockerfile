FROM node:latest
WORKDIR /usr/src/app
COPY coupon-service/src ./src
COPY coupon-service/package.json ./
RUN npm install
EXPOSE 3001
CMD [ "node", "src/index.js" ]