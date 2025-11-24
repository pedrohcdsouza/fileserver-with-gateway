FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY app/ ./app/

RUN npm run build

CMD ["npm", "start"]
