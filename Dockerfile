FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .

# prisma generate only needs a valid URL format, not a real DB
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npx prisma generate

FROM node:24-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY src ./src
COPY server.js .

RUN mkdir -p logs
RUN addgroup -S nodejs -g 1001 && adduser -S -u 1001 -G nodejs nodeuser
RUN chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 3000

CMD ["node", "server.js"]