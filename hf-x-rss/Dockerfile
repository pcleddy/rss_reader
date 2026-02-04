FROM node:20-slim

WORKDIR /app

COPY package.json .
COPY server.js .

RUN chown -R 1000:1000 /app
USER 1000

EXPOSE 7860

CMD ["node", "server.js"]
