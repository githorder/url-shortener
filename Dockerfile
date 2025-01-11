FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache \
    openssl \
    musl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

ENV PORT=3000

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:migrate:prod"]