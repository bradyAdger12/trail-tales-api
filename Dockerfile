FROM node:20-alpine
WORKDIR /app

ARG DB_URL
ENV DB_URL=${DB_URL}

COPY package.json ./

# Install curl
RUN apk add --no-cache curl

# Install yarn
RUN yarn install
COPY . .

# Generate Prisma client
RUN yarn generate

# Build the application
RUN yarn build

# Expose the port
EXPOSE 8080

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && yarn start"]
