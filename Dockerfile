# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Build the Nuxt 3 application
RUN yarn build

# Expose the port Nuxt will run on
EXPOSE 3000

# Start the Nuxt application
CMD ["yarn", "start"]
