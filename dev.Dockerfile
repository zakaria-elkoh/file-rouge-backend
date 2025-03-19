# Description: Dockerfile for development environment
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4000
CMD ["npm", "run", "start:dev"]