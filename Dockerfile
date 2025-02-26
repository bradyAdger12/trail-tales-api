FROM node:20-alpine
WORKDIR /app
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
COPY .env .env
RUN yarn generate
RUN yarn build
EXPOSE 8080
CMD ["yarn", "start"]
