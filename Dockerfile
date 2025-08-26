FROM node:20-alpine
WORKDIR /app

ARG DB_URL
ENV DB_URL=${DB_URL}

COPY package.json ./
RUN yarn install
COPY . .
RUN npx prisma migrate deploy
RUN yarn generate --no-engine
RUN yarn build
EXPOSE 8080
CMD ["yarn", "start"]
