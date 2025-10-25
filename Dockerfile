FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

FROM node:22-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/node_modules ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/. .

EXPOSE 3000

CMD ["node", "app.js"]
