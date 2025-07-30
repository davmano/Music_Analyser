FROM node:16-alpine

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

COPY . .

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8000

CMD ["node", "server.js"]
