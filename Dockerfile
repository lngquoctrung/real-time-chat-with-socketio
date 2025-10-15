FROM node:slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
RUN npm audit fix

COPY . .

FROM node:alpine AS runtime

WORKDIR /app

COPY --from=builder /app/node_modules ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/. .

EXPOSE 3000

CMD ["node", "app.js"]