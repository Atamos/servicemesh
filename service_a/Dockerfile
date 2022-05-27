FROM node:18.1.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000

CMD [ "node", "server.mjs" ]


