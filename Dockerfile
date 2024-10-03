FROM node:20

# Set environment variable for the port
ENV PORT=3800

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Set working directory inside the container
WORKDIR /src

# Copy and install dependencies
COPY package.json yarn.lock ./
RUN yarn

# Copy the rest of the application files and build the NestJS app
COPY ./ ./
RUN yarn nest build

# Command to run the app in production
CMD ["yarn", "start:prod"]
