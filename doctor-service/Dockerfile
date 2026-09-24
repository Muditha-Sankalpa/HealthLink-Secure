FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

#V13 FIX: previously no USER was set, so the container ran as root by
# default. node:20-alpine ships a built-in unprivileged "node" user
# (uid 1000) made exactly for this. Files copied above are owned by root,
# so chown them to "node" before switching to it, or the app can't read them.
RUN chown -R node:node /app
USER node

EXPOSE 5002
CMD ["node", "index.js"]
