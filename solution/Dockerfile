FROM node:20-alpine

WORKDIR /app


COPY package*.json ./


RUN npm install

COPY . .


EXPOSE 3000


HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1


CMD ["node", "src/index.js"]
