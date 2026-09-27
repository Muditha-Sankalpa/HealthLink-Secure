FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

#V13 FIX: run as the built-in-non-root "node" user instead of root.
RUN chown -R node:node /app
USER node

EXPOSE 5000
CMD ["node", "server.js"]

