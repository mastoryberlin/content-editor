FROM node:8.11.4

RUN mkdir /app
WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm audit fix

COPY . .
CMD [ "npm", "run", "dev" ]
