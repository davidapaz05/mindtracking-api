# stage de build
FROM node:20-alpine AS builder
WORKDIR /app

# deps p/ compilar módulos nativos (ex.: bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
# instala só prod deps de forma reprodutível
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# copia o restante do código
COPY . .

# stage final (sem ferramentas de build)
FROM node:20-alpine
WORKDIR /app

# ambiente de produção
ENV NODE_ENV=production

# copia node_modules e código do builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# segurança: roda como usuário padrão "node"
USER node

EXPOSE 3000
CMD ["node", "server.js"]