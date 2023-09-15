FROM node:latest
WORKDIR /usr/src/app
COPY benefit-service/src ./src
COPY benefit-service/package.json ./
RUN npm install
EXPOSE 3004

CMD [ "node", "src/index.js" ]