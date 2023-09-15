FROM node:latest
WORKDIR /usr/src/app
COPY user-service/src ./src
COPY user-service/.env ./
COPY user-service/package.json ./
RUN npm install
EXPOSE 3002
CMD [ "node", "src/index.js" ]