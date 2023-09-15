FROM node:latest
WORKDIR /usr/src/app
COPY bonus-booklet-service/src ./src
COPY bonus-booklet-service/package.json ./
RUN npm install
EXPOSE 3000
# 8080
CMD [ "node", "src/index.js" ]