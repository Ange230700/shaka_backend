# Dockerfile

# --- Base image ---
FROM node:24-alpine3.21 AS base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]
